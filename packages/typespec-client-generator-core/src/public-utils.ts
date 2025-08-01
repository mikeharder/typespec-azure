import {
  Diagnostic,
  Enum,
  Interface,
  Model,
  ModelProperty,
  Namespace,
  Operation,
  Scalar,
  Type,
  Union,
  createDiagnosticCollector,
  getEffectiveModelType,
  getFriendlyName,
  getNamespaceFullName,
  ignoreDiagnostics,
  isGlobalNamespace,
  isService,
  resolveEncodedName,
} from "@typespec/compiler";
import {
  HttpOperation,
  Visibility,
  getHttpOperation,
  getHttpPart,
  isMetadata,
  isVisible,
} from "@typespec/http";
import { getOperationId } from "@typespec/openapi";
import { Version, getVersions } from "@typespec/versioning";
import { pascalCase } from "change-case";
import pluralize from "pluralize";
import {
  getClientLocation,
  getClientNameOverride,
  getIsApiVersion,
  getOverriddenClientMethod,
  listClients,
  listOperationGroups,
  listOperationsInOperationGroup,
} from "./decorators.js";
import {
  SdkBodyParameter,
  SdkCookieParameter,
  SdkHeaderParameter,
  SdkHttpOperation,
  SdkHttpOperationExample,
  SdkMethodParameter,
  SdkModelPropertyType,
  SdkPathParameter,
  SdkQueryParameter,
  SdkServiceMethod,
  SdkType,
  TCGCContext,
} from "./interfaces.js";
import {
  AllScopes,
  TspLiteralType,
  getHttpBodyType,
  getHttpOperationResponseHeaders,
  hasExplicitClientOrOperationGroup,
  hasNoneVisibility,
  isAzureCoreTspModel,
  listAllUserDefinedNamespaces,
  removeVersionsLargerThanExplicitlySpecified,
  resolveDuplicateGenearatedName,
} from "./internal-utils.js";

/**
 * Return the default api version for a versioned service. Will return undefined if one does not exist
 * @param program
 * @param serviceNamespace
 * @returns
 */
export function getDefaultApiVersion(
  context: TCGCContext,
  serviceNamespace: Namespace,
): Version | undefined {
  try {
    const versions = getVersions(context.program, serviceNamespace)[1]!.getVersions();
    removeVersionsLargerThanExplicitlySpecified(context, versions);
    // follow versioning principals of the versioning library and return last in list
    return versions[versions.length - 1];
  } catch (e) {
    return undefined;
  }
}

function isModelProperty(type: any): type is ModelProperty {
  return type && typeof type === "object" && "kind" in type && type.kind === "ModelProperty";
}

/**
 * Return whether a parameter is the Api Version parameter of a client
 * @param program
 * @param parameter
 * @returns
 */
export function isApiVersion(context: TCGCContext, type: { name: string }): boolean {
  if (isModelProperty(type)) {
    const override = getIsApiVersion(context, type);
    if (override !== undefined) {
      return override;
    }
  }
  return (
    (isModelProperty(type) && type.type === context.getPackageVersionEnum()) ||
    type.name.toLowerCase().includes("apiversion") ||
    type.name.toLowerCase().includes("api-version")
  );
}

/**
 * If the given type is an anonymous model, returns a named model with same shape.
 * The finding logic will ignore all the properties of header/query/path/status-code metadata,
 * as well as the properties that are not visible in the given visibility if provided.
 * If the model found is also anonymous, the input type is returned unchanged.
 *
 * @param context
 * @param type
 * @returns
 */
export function getEffectivePayloadType(
  context: TCGCContext,
  type: Model,
  visibility?: Visibility,
): Model {
  const program = context.program;

  // if a type has name, we should resolve the name
  // this logic is for template cases, for e.g.,
  // model Catalog is TrackedResource<CatalogProperties>{}
  // model Deployment is TrackedResource<DeploymentProperties>{}
  // when pass them to getEffectiveModelType, we will get two different types
  // with the same name "TrackedResource" which will loose original infomation
  if (type.name) {
    return type;
  }
  const effective = getEffectiveModelType(
    program,
    type,
    (t) =>
      !isMetadata(context.program, t) &&
      !hasNoneVisibility(context, t) &&
      (visibility === undefined || isVisible(program, t, visibility)),
  );
  if (effective.name) {
    return effective;
  }
  return type;
}

/**
 * Get the library and wire name of a model property. Takes `@clientName` and `@encodedName` into account
 * @param context
 * @param property
 * @returns a tuple of the library and wire name for a model property
 */
export function getPropertyNames(context: TCGCContext, property: ModelProperty): [string, string] {
  return [getLibraryName(context, property), getWireName(context, property)];
}

/**
 * Get the library name of a property / parameter / operation / model / enum. Takes projections into account
 *
 * Returns name in the following order of priority
 * 1. language emitter name, i.e. @clientName("csharpSpecificName", "csharp") => "csharpSpecificName"
 * 2. client name, i.e. @clientName(""clientName") => "clientName"
 * 3. deprecated projected name
 * 4. friendly name, i.e. @friendlyName("friendlyName") => "friendlyName"
 * 5. name in typespec
 *
 * @param context
 * @param type
 * @returns the library name for a typespec type
 */
export function getLibraryName(
  context: TCGCContext,
  type: Type & { name?: string | symbol },
  scope?: string | typeof AllScopes,
): string {
  // 1. check if there's a client name
  const emitterSpecificName = getClientNameOverride(context, type, scope);
  if (emitterSpecificName && emitterSpecificName !== type.name) return emitterSpecificName;

  // 2. check if there's a friendly name, if so return friendly name
  const friendlyName = getFriendlyName(context.program, type);
  if (friendlyName) return friendlyName;

  // 3. if type is derived from template and name is the same as template, add template parameters' name as suffix
  if (
    typeof type.name === "string" &&
    type.name !== "" &&
    type.kind === "Model" &&
    type.templateMapper?.args
  ) {
    const generatedName = context.__generatedNames.get(type);
    if (generatedName) return generatedName;
    return resolveDuplicateGenearatedName(
      context,
      type,
      type.name +
        type.templateMapper.args
          .filter(
            (arg): arg is Model | Enum =>
              "kind" in arg &&
              (arg.kind === "Model" || arg.kind === "Enum" || arg.kind === "Union") &&
              arg.name !== undefined &&
              arg.name.length > 0,
          )
          .map((arg) => pascalCase(arg.name))
          .join(""),
    );
  }

  return typeof type.name === "string" ? type.name : "";
}

/**
 * Get the serialized name of a type.
 * @param context
 * @param type
 * @returns
 */
export function getWireName(context: TCGCContext, type: Type & { name: string }) {
  const encodedName = resolveEncodedName(context.program, type, "application/json");
  if (encodedName !== type.name) return encodedName;
  return type.name;
}

/**
 * Helper function to return cross language definition id for a type
 * @param type
 * @returns
 */
export function getCrossLanguageDefinitionId(
  context: TCGCContext,
  type: Union | Model | Enum | Scalar | ModelProperty | Operation | Namespace | Interface,
  operation?: Operation,
  appendNamespace: boolean = true,
): string {
  let retval = type.name || "anonymous";
  let namespace = type.kind === "ModelProperty" ? type.model?.namespace : type.namespace;
  switch (type.kind) {
    // Enum and Scalar will always have a name
    case "Union":
    case "Model":
      if (type.name) {
        break;
      }
      const contextPath = operation
        ? getContextPath(context, operation, type)
        : findContextPath(context, type);
      const namingPart = contextPath.slice(findLastNonAnonymousNode(contextPath));
      if (
        namingPart[0]?.type?.kind === "Model" ||
        namingPart[0]?.type?.kind === "Union" ||
        namingPart[0]?.type?.kind === "Operation"
      ) {
        namespace = namingPart[0]?.type?.namespace;
      }
      retval =
        namingPart
          .map((x) =>
            x.type?.kind === "Model" || x.type?.kind === "Union"
              ? x.type.name || x.name
              : x.name || "anonymous",
          )
          .join(".") +
        "." +
        retval;
      break;
    case "ModelProperty":
      if (type.model) {
        // operation parameter case
        if (type.model === operation?.parameters) {
          retval = `${getCrossLanguageDefinitionId(context, operation, undefined, false)}.${retval}`;
        } else {
          retval = `${getCrossLanguageDefinitionId(context, type.model, operation, false)}.${retval}`;
        }
      }
      break;
    case "Operation":
      if (type.interface) {
        retval = `${getCrossLanguageDefinitionId(context, type.interface, undefined, false)}.${retval}`;
      }
      break;
  }
  if (appendNamespace && namespace && getNamespaceFullName(namespace)) {
    retval = `${getNamespaceFullName(namespace)}.${retval}`;
  }
  return retval;
}

/**
 * Helper function return the cross langauge package id for a package
 */
export function getCrossLanguagePackageId(context: TCGCContext): [string, readonly Diagnostic[]] {
  const diagnostics = createDiagnosticCollector();
  const serviceNamespaces = listAllServiceNamespaces(context);
  if (serviceNamespaces.length === 0) return diagnostics.wrap("");
  return diagnostics.wrap(getNamespaceFullName(serviceNamespaces[0]));
}

/**
 * Create a name for anonymous model
 * @param context
 * @param type
 */
export function getGeneratedName(
  context: TCGCContext,
  type: Model | Union | TspLiteralType,
  operation?: Operation,
): string {
  const generatedName = context.__generatedNames.get(type);
  if (generatedName) return generatedName;

  const contextPath = operation
    ? getContextPath(context, operation, type)
    : findContextPath(context, type);
  const createdName = buildNameFromContextPaths(context, type, contextPath);
  return createdName;
}

/**
 * Traverse each operation and model to find one possible context path for the given type.
 * @param context
 * @param type
 * @returns
 */
function findContextPath(
  context: TCGCContext,
  type: Model | Union | TspLiteralType,
): ContextNode[] {
  // orphan models
  for (const currNamespace of listAllUserDefinedNamespaces(context)) {
    for (const model of currNamespace.models.values()) {
      if (
        [...model.properties.values()].filter((p) => !isMetadata(context.program, p)).length === 0
      )
        continue;
      const result = getContextPath(context, model, type);
      if (result.length > 0) {
        return result;
      }
    }
  }
  for (const client of listClients(context)) {
    for (const operation of listOperationsInOperationGroup(context, client)) {
      const result = getContextPath(context, operation, type);
      if (result.length > 0) {
        return result;
      }
    }
    for (const og of listOperationGroups(context, client, true)) {
      for (const operation of listOperationsInOperationGroup(context, og)) {
        const result = getContextPath(context, operation, type);
        if (result.length > 0) {
          return result;
        }
      }
    }
  }
  return [];
}

interface ContextNode {
  name: string;
  type: Model | Union | TspLiteralType | Operation;
}

/**
 * Find one possible context path for the given type in the given operation or model.
 * @param context
 * @param root
 * @param typeToFind
 * @returns
 */
function getContextPath(
  context: TCGCContext,
  root: Operation | Model,
  typeToFind: Model | Union | TspLiteralType,
): ContextNode[] {
  // use visited set to avoid cycle model reference
  const visited: Set<Type> = new Set<Type>();
  let result: ContextNode[];

  if (root.kind === "Operation") {
    const httpOperation = getHttpOperationWithCache(context, root);

    if (httpOperation.parameters.body) {
      visited.clear();
      result = [{ name: root.name, type: root }];
      const bodyType = getHttpBodyType(httpOperation.parameters.body);
      if (dfsModelProperties(typeToFind, bodyType, "Request")) {
        return result;
      }
    }

    for (const parameter of Object.values(httpOperation.parameters.parameters)) {
      visited.clear();
      result = [{ name: root.name, type: root }];
      if (
        dfsModelProperties(typeToFind, parameter.param.type, `Request${pascalCase(parameter.name)}`)
      ) {
        return result;
      }
    }

    for (const response of httpOperation.responses) {
      for (const innerResponse of response.responses) {
        if (innerResponse.body?.type) {
          visited.clear();
          result = [{ name: root.name, type: root }];
          if (dfsModelProperties(typeToFind, innerResponse.body.type, "Response", true)) {
            return result;
          }
        }

        const headers = getHttpOperationResponseHeaders(innerResponse);
        if (headers) {
          for (const header of Object.values(headers)) {
            visited.clear();
            result = [{ name: root.name, type: root }];
            if (dfsModelProperties(typeToFind, header.type, `Response${pascalCase(header.name)}`)) {
              return result;
            }
          }
        }
      }
    }

    const overriddenClientMethod = getOverriddenClientMethod(context, root);
    visited.clear();
    result = [{ name: root.name, type: root }];
    if (dfsModelProperties(typeToFind, overriddenClientMethod ?? root.parameters, "Parameter")) {
      return result;
    }
  } else {
    visited.clear();
    result = [];
    if (dfsModelProperties(typeToFind, root, root.name)) {
      return result;
    }
  }
  return [];

  /**
   * Traverse each node, if it is not model or union, no need to traverse anymore.
   * If it is the expected type just return.
   * If it is array or dict, traverse the array/dict item node. e.g. {name: string}[] case.
   * If it is model, add the current node to the path and traverse each property node.
   * If it is model, traverse the base and derived model node if existed.
   * @param expectedType
   * @param currentType
   * @param displayName
   * @param currentContextPath
   * @param contextPaths
   * @param visited
   * @returns
   */
  function dfsModelProperties(
    expectedType: Model | Union | TspLiteralType,
    currentType: Type,
    displayName: string,
    needFindEffectiveType: boolean = false,
  ): boolean {
    if (currentType == null || visited.has(currentType)) {
      // cycle reference detected
      return false;
    }

    if (!["Model", "Union", "String", "Number", "Boolean"].includes(currentType.kind)) {
      return false;
    }

    visited.add(currentType);

    if (currentType === expectedType) {
      result.push({ name: displayName, type: currentType });
      return true;
    } else if (currentType.kind === "Model") {
      // Peel off HttpPart<MyRealType> to get "MyRealType"
      const typeWrappedByHttpPart = getHttpPart(context.program, currentType);
      if (typeWrappedByHttpPart) {
        return dfsModelProperties(expectedType, typeWrappedByHttpPart.type, displayName);
      }

      if (
        currentType.indexer &&
        currentType.properties.size === 0 &&
        ((currentType.indexer.key.name === "string" && currentType.name === "Record") ||
          currentType.indexer.key.name === "integer")
      ) {
        // handle array or dict
        const dictOrArrayItemType: Type = currentType.indexer.value;
        return dfsModelProperties(
          expectedType,
          dictOrArrayItemType,
          pluralize.singular(displayName),
        );
      }

      // handle model
      if (needFindEffectiveType) {
        currentType = getEffectiveModelType(context.program, currentType);
      }
      result.push({ name: displayName, type: currentType });
      for (const property of currentType.properties.values()) {
        // traverse model property
        // use property.name as displayName
        const result = dfsModelProperties(expectedType, property.type, property.name);
        if (result) return true;
      }
      // handle additional properties type: model MyModel is Record<> {}
      if (currentType.sourceModel?.kind === "Model" && currentType.sourceModel?.name === "Record") {
        const result = dfsModelProperties(
          expectedType,
          currentType.sourceModel!.indexer!.value!,
          "AdditionalProperty",
        );
        if (result) return true;
      }
      // handle additional properties type: model MyModel { ...Record<>}
      if (currentType.indexer) {
        const result = dfsModelProperties(
          expectedType,
          currentType.indexer.value,
          "AdditionalProperty",
        );
        if (result) return true;
      }
      // handle additional properties type: model MyModel extends Record<> {}
      const baseModel = currentType.baseModel;
      if (baseModel) {
        if (baseModel.name === "Record") {
          const result = dfsModelProperties(
            expectedType,
            baseModel.indexer!.value!,
            "AdditionalProperty",
          );
          if (result) return true;
        }
      }
      result.pop();
      if (baseModel) {
        const result = dfsModelProperties(expectedType, baseModel, baseModel.name);
        if (result) return true;
      }
      // TODO: come back and see if derived models are needed to change
      for (const derivedModel of currentType.derivedModels) {
        const result = dfsModelProperties(expectedType, derivedModel, derivedModel.name);
        if (result) return true;
      }
      return false;
    } else if (currentType.kind === "Union") {
      // handle union
      for (const unionType of currentType.variants.values()) {
        // traverse union type
        // use unionType.name as displayName
        const result = dfsModelProperties(expectedType, unionType.type, displayName);
        if (result) return true;
      }
      return false;
    } else {
      return false;
    }
  }
}

function findLastNonAnonymousNode(contextPath: ContextNode[]): number {
  let lastNonAnonymousModelNodeIndex = contextPath.length - 1;
  while (lastNonAnonymousModelNodeIndex >= 0) {
    const currType = contextPath[lastNonAnonymousModelNodeIndex].type;
    if (
      (currType.kind === "Model" || currType.kind === "Union" || currType.kind === "Operation") &&
      currType.name
    ) {
      // it's non anonymous node
      break;
    } else {
      --lastNonAnonymousModelNodeIndex;
    }
  }
  return lastNonAnonymousModelNodeIndex;
}

/**
 * The logic is basically three steps:
 * 1. find the last nonanonymous model node, this node can be operation node or model node which is not anonymous
 * 2. build the name from the last nonanonymous model node to the end of the path
 * 3. simplely handle duplication with adding number suffix
 * @param contextPaths
 * @returns
 */
function buildNameFromContextPaths(
  context: TCGCContext,
  type: Union | Model | TspLiteralType,
  contextPath: ContextNode[],
): string {
  // fallback to empty name for corner case
  if (contextPath.length === 0) {
    return "";
  }

  // 1. find the last non-anonymous model node
  const lastNonAnonymousNodeIndex = findLastNonAnonymousNode(contextPath);
  // 2. build name
  let createName: string = "";
  for (let j = lastNonAnonymousNodeIndex; j < contextPath.length; j++) {
    const currContextPathType = contextPath[j]?.type;
    if (
      currContextPathType?.kind === "String" ||
      currContextPathType?.kind === "Number" ||
      currContextPathType?.kind === "Boolean"
    ) {
      // constant type
      createName = `${createName}${pascalCase(contextPath[j].name)}`;
    } else if (!currContextPathType?.name || currContextPathType.kind === "Operation") {
      // is anonymous node or operation node
      createName = `${createName}${pascalCase(contextPath[j].name)}`;
    } else {
      // is non-anonymous node, use type name
      createName = `${createName}${currContextPathType!.name!}`;
    }
  }
  // 3. simplely handle duplication
  createName = resolveDuplicateGenearatedName(context, type, createName);
  return createName;
}

export function getHttpOperationWithCache(
  context: TCGCContext,
  operation: Operation,
): HttpOperation {
  if (context.__httpOperationCache?.has(operation)) {
    return context.__httpOperationCache.get(operation)!;
  }
  const httpOperation = ignoreDiagnostics(getHttpOperation(context.program, operation));
  context.__httpOperationCache!.set(operation, httpOperation);
  return httpOperation;
}

/**
 * Get the examples for a given http operation.
 */
export function getHttpOperationExamples(
  context: TCGCContext,
  operation: HttpOperation,
): SdkHttpOperationExample[] {
  return context.__httpOperationExamples.get(operation) ?? [];
}

export function isAzureCoreModel(t: SdkType): boolean {
  return t.__raw !== undefined && isAzureCoreTspModel(t.__raw);
}

/**
 * Judge whether a type is a paged result model.
 *
 * @param context TCGC context
 * @param t Any TCGC types
 * @returns
 */
export function isPagedResultModel(context: TCGCContext, t: SdkType): boolean {
  return context.__pagedResultSet.has(t);
}

/**
 * Find corresponding http parameter list for a client initialization parameter, a service method parameter or a property of a service method parameter.
 *
 * @param method
 * @param param
 * @returns
 */
export function getHttpOperationParameter(
  method: SdkServiceMethod<SdkHttpOperation>,
  param: SdkMethodParameter | SdkModelPropertyType,
):
  | SdkPathParameter
  | SdkQueryParameter
  | SdkHeaderParameter
  | SdkCookieParameter
  | SdkBodyParameter
  | SdkModelPropertyType
  | undefined {
  const operation = method.operation;
  // BFS to find the corresponding http parameter.
  // An http parameter will be mapped to a method/client parameter, several method/client parameters (body spread case), or one property of a method property (metadata on property case).
  // So, when we try to find which http parameter a parameter or property corresponds to, we compare the `correspondingMethodParams` list directly.
  // If a method parameter is spread case, then we need to find the cooresponding http body parameter's property.
  for (const p of operation.parameters) {
    for (const cp of p.correspondingMethodParams) {
      if (cp === param) {
        return p;
      }
    }
  }
  if (operation.bodyParam) {
    for (const cp of operation.bodyParam.correspondingMethodParams) {
      if (cp === param) {
        if (operation.bodyParam.type.kind === "model" && operation.bodyParam.type !== param.type) {
          return operation.bodyParam.type.properties.find(
            (p) => p.kind === "property" && p.name === param.name,
          ) as SdkModelPropertyType | undefined;
        }
        return operation.bodyParam;
      }
    }
  }
  return undefined;
}

/**
 * Currently, listServices can only be called from a program instance. This doesn't work well if we're doing mutation,
 * because we want to just mutate the global namespace once, then find all of the services in the program, since we aren't
 * able to explicitly tell listServices to iterate over our specific mutated global namespace. We're going to use this function
 * instead to list all of the services in the global namespace.
 *
 * See https://github.com/microsoft/typespec/issues/6247
 *
 * @param context
 */
export function listAllServiceNamespaces(context: TCGCContext): Namespace[] {
  const serviceNamespaces: Namespace[] = [];
  for (const ns of listAllUserDefinedNamespaces(context)) {
    if (isService(context.program, ns)) {
      serviceNamespaces.push(ns);
    }
  }
  return serviceNamespaces;
}

/**
 * Calculate the operation ID for a given operation.
 *
 * @param context TCGC context
 * @param operation
 * @param honorRenaming
 * @returns
 */
export function resolveOperationId(
  context: TCGCContext,
  operation: Operation,
  honorRenaming: boolean = false,
) {
  const { program } = context;
  // if @operationId was specified use that value
  const explicitOperationId = getOperationId(program, operation);
  if (explicitOperationId) {
    return explicitOperationId;
  }

  const operationName = honorRenaming ? getLibraryName(context, operation) : operation.name;

  let operationInterface: Interface | undefined = operation.interface;
  let operationNamespace: Namespace | undefined = operation.namespace;

  const clientLocation = getClientLocation(context, operation);

  if (!hasExplicitClientOrOperationGroup(context) && clientLocation) {
    if (typeof clientLocation === "string") {
      return `${clientLocation}_${operationName}`;
    }
    if (clientLocation.kind === "Interface") {
      operationInterface = clientLocation;
    } else {
      operationInterface = undefined;
      operationNamespace = clientLocation;
    }
  }

  if (operationInterface) {
    return `${honorRenaming ? getLibraryName(context, operationInterface) : operationInterface.name}_${operationName}`;
  }
  if (
    operationNamespace === undefined ||
    isGlobalNamespace(program, operationNamespace) ||
    isService(program, operationNamespace)
  ) {
    return operationName;
  }

  return `${honorRenaming ? getLibraryName(context, operationNamespace) : operationNamespace.name}_${operationName}`;
}

/**
 * Judge whether a model's property is an HTTP metadata.
 * @param context TCGC context
 * @param property
 * @returns
 */
export function isHttpMetadata(context: TCGCContext, property: SdkModelPropertyType): boolean {
  return property.__raw !== undefined && isMetadata(context.program, property.__raw);
}
