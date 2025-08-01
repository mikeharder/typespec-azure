import {
  Diagnostic,
  ModelProperty,
  Operation,
  Type,
  compilerAssert,
  createDiagnosticCollector,
  getEncode,
  getSummary,
  isErrorModel,
} from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import {
  HttpOperation,
  HttpOperationParameter,
  HttpOperationPathParameter,
  HttpOperationQueryParameter,
  Visibility,
  getCookieParamOptions,
  getHeaderFieldName,
  getHeaderFieldOptions,
  getPathParamName,
  getQueryParamName,
  getQueryParamOptions,
  isBody,
  isCookieParam,
  isHeader,
  isPathParam,
  isQueryParam,
} from "@typespec/http";
import { getStreamMetadata } from "@typespec/http/experimental";
import { camelCase } from "change-case";
import { getParamAlias, getResponseAsBool } from "./decorators.js";
import {
  CollectionFormat,
  SdkBodyParameter,
  SdkCookieParameter,
  SdkHeaderParameter,
  SdkHttpErrorResponse,
  SdkHttpOperation,
  SdkHttpParameter,
  SdkHttpResponse,
  SdkMethodParameter,
  SdkModelPropertyType,
  SdkModelType,
  SdkPathParameter,
  SdkQueryParameter,
  SdkServiceResponseHeader,
  SdkType,
  TCGCContext,
} from "./interfaces.js";
import {
  compareModelProperties,
  getAvailableApiVersions,
  getClientDoc,
  getHttpBodyType,
  getHttpOperationResponseHeaders,
  getStreamAsBytes,
  getTypeDecorators,
  isAcceptHeader,
  isContentTypeHeader,
  isHttpBodySpread,
  isNeverOrVoidType,
  isSubscriptionId,
} from "./internal-utils.js";
import { createDiagnostic } from "./lib.js";
import { isMediaTypeJson, isMediaTypeOctetStream, isMediaTypeTextPlain } from "./media-types.js";
import {
  getCrossLanguageDefinitionId,
  getEffectivePayloadType,
  getWireName,
  isApiVersion,
} from "./public-utils.js";
import {
  addEncodeInfo,
  getClientTypeWithDiagnostics,
  getSdkConstant,
  getSdkModelPropertyTypeBase,
  getTypeSpecBuiltInType,
} from "./types.js";

export function getSdkHttpOperation(
  context: TCGCContext,
  httpOperation: HttpOperation,
  methodParameters: SdkMethodParameter[],
): [SdkHttpOperation, readonly Diagnostic[]] {
  const tk = $(context.program);
  const diagnostics = createDiagnosticCollector();
  const { responses, exceptions } = diagnostics.pipe(
    getSdkHttpResponseAndExceptions(context, httpOperation),
  );
  if (getResponseAsBool(context, httpOperation.operation)) {
    // we make sure valid responses and 404 responses are booleans
    for (const response of responses) {
      // all valid responses will return boolean
      response.type = getSdkConstant(context, tk.literal.createBoolean(true));
    }
    const fourOFourResponse = exceptions.find((e) => e.statusCodes === 404);
    if (fourOFourResponse) {
      fourOFourResponse.type = getSdkConstant(context, tk.literal.createBoolean(false));
      // move from exception to valid response with status code 404
      responses.push({
        ...fourOFourResponse,
        statusCodes: 404,
      });
      exceptions.splice(exceptions.indexOf(fourOFourResponse), 1);
      // remove the exception from the list
    } else {
      // add 404 response to the list of valid responses
      responses.push({
        kind: "http",
        statusCodes: 404,
        type: getSdkConstant(context, tk.literal.createBoolean(false)),
        apiVersions: getAvailableApiVersions(
          context,
          httpOperation.operation,
          httpOperation.operation,
        ),
        headers: [],
        __raw: (responses[0] || exceptions[0]).__raw,
      });
    }
  }
  const successResponsesWithBodies = responses.filter((r) => r.type);
  const parameters = diagnostics.pipe(
    getSdkHttpParameters(context, httpOperation, methodParameters, successResponsesWithBodies[0]),
  );
  filterOutUselessPathParameters(context, httpOperation, methodParameters);
  return diagnostics.wrap({
    __raw: httpOperation,
    kind: "http",
    path: httpOperation.path,
    uriTemplate: httpOperation.uriTemplate,
    verb: httpOperation.verb,
    ...parameters,
    responses,
    exceptions,
  });
}

export function isSdkHttpParameter(context: TCGCContext, type: ModelProperty): boolean {
  const program = context.program;
  return (
    isPathParam(program, type) ||
    isQueryParam(program, type) ||
    isHeader(program, type) ||
    isBody(program, type) ||
    isCookieParam(program, type)
  );
}

interface SdkHttpParameters {
  parameters: (SdkPathParameter | SdkQueryParameter | SdkHeaderParameter | SdkCookieParameter)[];
  bodyParam?: SdkBodyParameter;
}

function getSdkHttpParameters(
  context: TCGCContext,
  httpOperation: HttpOperation,
  methodParameters: SdkMethodParameter[],
  responseBody?: SdkHttpResponse | SdkHttpErrorResponse,
): [SdkHttpParameters, readonly Diagnostic[]] {
  const diagnostics = createDiagnosticCollector();
  const retval: SdkHttpParameters = {
    parameters: [],
    bodyParam: undefined,
  };

  retval.parameters = httpOperation.parameters.parameters
    .filter((x) => !isNeverOrVoidType(x.param.type))
    .map((x) =>
      diagnostics.pipe(getSdkHttpParameter(context, x.param, httpOperation.operation, x, x.type)),
    ) as (SdkPathParameter | SdkQueryParameter | SdkHeaderParameter | SdkCookieParameter)[];
  const headerParams = retval.parameters.filter(
    (x): x is SdkHeaderParameter => x.kind === "header",
  );
  // add operation info onto body param
  const tspBody = httpOperation.parameters.body;
  // we add correspondingMethodParams after we create the type, since we need the info on the type
  const correspondingMethodParams: (SdkMethodParameter | SdkModelPropertyType)[] = [];
  if (tspBody) {
    if (tspBody.bodyKind === "file") {
      // file body is not supported yet
      diagnostics.add(
        createDiagnostic({
          code: "unsupported-http-file-body",
          target: tspBody.property ?? tspBody.type,
        }),
      );
      return diagnostics.wrap(retval);
    }
    if (tspBody.property && !isNeverOrVoidType(tspBody.property.type)) {
      const bodyParam = diagnostics.pipe(
        getSdkHttpParameter(context, tspBody.property, httpOperation.operation, undefined, "body"),
      );
      if (bodyParam.kind !== "body") {
        diagnostics.add(
          createDiagnostic({
            code: "unexpected-http-param-type",
            target: tspBody.property,
            format: {
              paramName: tspBody.property.name,
              expectedType: "body",
              actualType: bodyParam.kind,
            },
          }),
        );
        return diagnostics.wrap(retval);
      }
      retval.bodyParam = bodyParam;
    } else if (!isNeverOrVoidType(tspBody.type)) {
      const type = diagnostics.pipe(
        getClientTypeWithDiagnostics(context, getHttpBodyType(tspBody), httpOperation.operation),
      );
      const name = camelCase((type as { name: string }).name ?? "body");
      retval.bodyParam = {
        kind: "body",
        name,
        isGeneratedName: true,
        serializedName: "",
        doc: getClientDoc(context, tspBody.type),
        summary: getSummary(context.program, tspBody.type),
        onClient: false,
        contentTypes: [],
        defaultContentType: "application/json", // actual content type info is added later
        isApiVersionParam: false,
        apiVersions: getAvailableApiVersions(context, tspBody.type, httpOperation.operation),
        type,
        optional: isHttpBodySpread(tspBody) ? false : (tspBody.property?.optional ?? false), // optional is always false for spread body
        correspondingMethodParams,
        crossLanguageDefinitionId: `${getCrossLanguageDefinitionId(context, httpOperation.operation)}.body`,
        decorators: diagnostics.pipe(getTypeDecorators(context, tspBody.type)),
        access: "public",
      };
    }
    if (retval.bodyParam) {
      retval.bodyParam.correspondingMethodParams = diagnostics.pipe(
        getCorrespondingMethodParams(
          context,
          httpOperation.operation,
          methodParameters,
          retval.bodyParam,
        ),
      );

      addContentTypeInfoToBodyParam(context, httpOperation, retval.bodyParam);

      // map stream request body type to bytes
      if (getStreamMetadata(context.program, httpOperation.parameters)) {
        retval.bodyParam.type = diagnostics.pipe(
          getStreamAsBytes(context, retval.bodyParam.type.__raw!),
        );
        retval.bodyParam.correspondingMethodParams.map((p) => (p.type = retval.bodyParam!.type));
      }
    }
  }
  if (retval.bodyParam && !headerParams.some((h) => isContentTypeHeader(h))) {
    // if we have a body param and no content type header, we add one
    const contentTypeBase = {
      ...createContentTypeOrAcceptHeader(context, httpOperation, retval.bodyParam),
      doc: `Body parameter's content type. Known values are ${retval.bodyParam.contentTypes}`,
    };
    if (!methodParameters.some((m) => m.name === "contentType")) {
      methodParameters.push({
        ...contentTypeBase,
        kind: "method",
      });
    }
    retval.parameters.push({
      ...contentTypeBase,
      kind: "header",
      serializedName: "Content-Type",
      correspondingMethodParams,
    });
  }
  if (responseBody && !headerParams.some((h) => isAcceptHeader(h))) {
    // If our operation returns a body, we add an accept header if none exist
    const acceptBase = {
      ...createContentTypeOrAcceptHeader(context, httpOperation, responseBody),
    };
    if (!methodParameters.some((m) => m.name === "accept")) {
      methodParameters.push({
        ...acceptBase,
        kind: "method",
      });
    }
    retval.parameters.push({
      ...acceptBase,
      kind: "header",
      serializedName: "Accept",
      correspondingMethodParams,
    });
  }
  for (const param of retval.parameters) {
    param.correspondingMethodParams = diagnostics.pipe(
      getCorrespondingMethodParams(context, httpOperation.operation, methodParameters, param),
    );
  }
  return diagnostics.wrap(retval);
}

function createContentTypeOrAcceptHeader(
  context: TCGCContext,
  httpOperation: HttpOperation,
  bodyObject: SdkBodyParameter | SdkHttpResponse | SdkHttpErrorResponse,
): Omit<SdkMethodParameter, "kind"> {
  const name = bodyObject.kind === "body" ? "contentType" : "accept";
  let type: SdkType = getTypeSpecBuiltInType(context, "string");
  // for contentType, we treat it as a constant IFF there's one value and it's one of:
  //  - application/json
  //  - text/plain
  //  - application/octet-stream
  // this is to prevent a breaking change when a service adds more content types in the future.
  // e.g. the service accepting image/png then later image/jpeg should _not_ be a breaking change.
  //
  // for accept, we treat it as a constant IFF there's a single value. adding more content types
  // for this case is considered a breaking change for SDKs so we want to surface it as such.
  // e.g. the service returns image/png then later provides the option to return image/jpeg.
  if (
    bodyObject.contentTypes &&
    bodyObject.contentTypes.length === 1 &&
    (isMediaTypeJson(bodyObject.contentTypes[0]) ||
      isMediaTypeTextPlain(bodyObject.contentTypes[0]) ||
      isMediaTypeOctetStream(bodyObject.contentTypes[0]) ||
      name === "accept")
  ) {
    // in this case, we just want a content type of application/json
    type = {
      kind: "constant",
      value: bodyObject.contentTypes[0],
      valueType: type,
      name: `${httpOperation.operation.name}ContentType`,
      isGeneratedName: true,
      decorators: [],
    };
  }
  const optional = bodyObject.kind === "body" ? bodyObject.optional : false;
  // No need for clientDefaultValue because it's a constant, it only has one value
  return {
    type,
    name,
    isGeneratedName: true,
    apiVersions: bodyObject.apiVersions,
    isApiVersionParam: false,
    onClient: false,
    optional: optional,
    crossLanguageDefinitionId: `${getCrossLanguageDefinitionId(context, httpOperation.operation)}.${name}`,
    decorators: [],
    access: "public",
  };
}

function addContentTypeInfoToBodyParam(
  context: TCGCContext,
  httpOperation: HttpOperation,
  bodyParam: SdkBodyParameter,
): readonly Diagnostic[] {
  const diagnostics = createDiagnosticCollector();
  const tspBody = httpOperation.parameters.body;
  if (!tspBody) return diagnostics.diagnostics;
  const contentTypes = tspBody.contentTypes;
  compilerAssert(contentTypes.length > 0, "contentTypes should not be empty"); // this should be http lib bug
  const defaultContentType = contentTypes.includes("application/json")
    ? "application/json"
    : contentTypes[0];
  bodyParam.contentTypes = contentTypes;
  bodyParam.defaultContentType = defaultContentType;
  diagnostics.pipe(addEncodeInfo(context, bodyParam.__raw!, bodyParam.type, defaultContentType));
  // set the correct encode for body parameter of method according to the content-type
  if (bodyParam.correspondingMethodParams.length === 1) {
    const methodBodyParam = bodyParam.correspondingMethodParams[0];
    diagnostics.pipe(
      addEncodeInfo(
        context,
        methodBodyParam.__raw!,
        methodBodyParam.type,
        bodyParam.defaultContentType,
      ),
    );
  }
  return diagnostics.diagnostics;
}

/**
 * Generate TCGC Http parameter type, `httpParam` or `location` should be provided at least one
 * @param context
 * @param param TypeSpec param for the http parameter
 * @param operation
 * @param httpParam TypeSpec Http parameter type
 * @param location Location of the http parameter
 * @returns
 */
export function getSdkHttpParameter(
  context: TCGCContext,
  param: ModelProperty,
  operation?: Operation,
  httpParam?: HttpOperationParameter,
  location?: "path" | "query" | "header" | "body" | "cookie",
): [SdkHttpParameter, readonly Diagnostic[]] {
  const diagnostics = createDiagnosticCollector();
  const base = diagnostics.pipe(getSdkModelPropertyTypeBase(context, param, operation));
  const program = context.program;
  if (isPathParam(context.program, param) || location === "path") {
    return diagnostics.wrap({
      ...base,
      kind: "path",
      explode: (httpParam as HttpOperationPathParameter)?.explode ?? false,
      style: (httpParam as HttpOperationPathParameter)?.style ?? "simple",
      // url type need allow reserved
      allowReserved:
        (httpParam as HttpOperationPathParameter)?.allowReserved ??
        $(program).type.isAssignableTo(param.type, $(program).builtin.url, param.type),
      serializedName: getPathParamName(program, param) ?? base.name,
      correspondingMethodParams: [],
      optional: param.optional,
    });
  }
  if (isCookieParam(context.program, param) || location === "cookie") {
    return diagnostics.wrap({
      ...base,
      kind: "cookie",
      serializedName: getCookieParamOptions(program, param)?.name ?? base.name,
      correspondingMethodParams: [],
      optional: param.optional,
    });
  }
  if (isBody(context.program, param) || location === "body") {
    return diagnostics.wrap({
      ...base,
      kind: "body",
      serializedName: param.name === "" ? "body" : getWireName(context, param),
      contentTypes: ["application/json"],
      defaultContentType: "application/json",
      optional: param.optional,
      correspondingMethodParams: [],
    });
  }
  const headerQueryBase = {
    ...base,
    optional: param.optional,
    collectionFormat: diagnostics.pipe(getCollectionFormat(context, param)),
    correspondingMethodParams: [],
  };
  if (isQueryParam(context.program, param) || location === "query") {
    return diagnostics.wrap({
      ...headerQueryBase,
      kind: "query",
      serializedName: getQueryParamName(program, param) ?? base.name,
      explode: (httpParam as HttpOperationQueryParameter)?.explode,
    });
  }
  if (!(isHeader(context.program, param) || location === "header")) {
    diagnostics.add(
      createDiagnostic({
        code: "unexpected-http-param-type",
        target: param,
        format: {
          paramName: param.name,
          expectedType: "path, query, header, or body",
          actualType: param.kind,
        },
      }),
    );
  }
  return diagnostics.wrap({
    ...headerQueryBase,
    kind: "header",
    serializedName: getHeaderFieldName(program, param) ?? base.name,
  });
}

function getSdkHttpResponseAndExceptions(
  context: TCGCContext,
  httpOperation: HttpOperation,
): [
  {
    responses: SdkHttpResponse[];
    exceptions: SdkHttpErrorResponse[];
  },
  readonly Diagnostic[],
] {
  const diagnostics = createDiagnosticCollector();
  const responses: SdkHttpResponse[] = [];
  const exceptions: SdkHttpErrorResponse[] = [];
  for (const response of httpOperation.responses) {
    const headers: SdkServiceResponseHeader[] = [];
    let body: Type | undefined;
    let type: SdkType | undefined;
    let contentTypes: string[] = [];
    for (const innerResponse of response.responses) {
      const defaultContentType = innerResponse.body?.contentTypes.includes("application/json")
        ? "application/json"
        : innerResponse.body?.contentTypes[0];
      for (const header of getHttpOperationResponseHeaders(innerResponse)) {
        if (isNeverOrVoidType(header.type)) continue;
        headers.push({
          ...diagnostics.pipe(
            getSdkModelPropertyTypeBase(context, header, httpOperation.operation),
          ),
          __raw: header,
          kind: "responseheader",
          serializedName: getHeaderFieldName(context.program, header),
        });
        context.__responseHeaderCache.set(header, headers[headers.length - 1]);
      }
      if (innerResponse.body && !isNeverOrVoidType(innerResponse.body.type)) {
        if (body && body !== innerResponse.body.type) {
          diagnostics.add(
            createDiagnostic({
              code: "multiple-response-types",
              target: innerResponse.body.type,
              format: {
                operation: httpOperation.operation.name,
                response:
                  innerResponse.body.type.kind === "Model"
                    ? innerResponse.body.type.name
                    : innerResponse.body.type.kind,
              },
            }),
          );
        }
        contentTypes = contentTypes.concat(innerResponse.body.contentTypes);
        body =
          innerResponse.body.type.kind === "Model"
            ? getEffectivePayloadType(context, innerResponse.body.type, Visibility.Read)
            : innerResponse.body.type;
        if (getStreamMetadata(context.program, innerResponse)) {
          // map stream response body type to bytes
          type = diagnostics.pipe(getStreamAsBytes(context, innerResponse.body.type));
        } else {
          type = diagnostics.pipe(
            getClientTypeWithDiagnostics(context, body, httpOperation.operation),
          );
          if (innerResponse.body.property) {
            addEncodeInfo(context, innerResponse.body.property, type, defaultContentType);
          }
        }
      }
    }
    const sdkResponse = {
      __raw: response,
      type,
      headers,
      contentTypes: contentTypes.length > 0 ? contentTypes : undefined,
      defaultContentType: contentTypes.includes("application/json")
        ? "application/json"
        : contentTypes[0],
      apiVersions: getAvailableApiVersions(
        context,
        httpOperation.operation,
        httpOperation.operation,
      ),
      description: response.description,
    };

    if (
      response.statusCodes === "*" ||
      isErrorModel(context.program, response.type) ||
      (body && isErrorModel(context.program, body))
    ) {
      exceptions.push({
        ...sdkResponse,
        kind: "http",
        statusCodes: response.statusCodes,
      });
    } else {
      responses.push({
        ...sdkResponse,
        kind: "http",
        statusCodes: response.statusCodes,
      });
    }
  }
  return diagnostics.wrap({ responses, exceptions });
}

export function getCorrespondingMethodParams(
  context: TCGCContext,
  operation: Operation,
  methodParameters: SdkMethodParameter[],
  serviceParam: SdkHttpParameter,
): [(SdkMethodParameter | SdkModelPropertyType)[], readonly Diagnostic[]] {
  const diagnostics = createDiagnosticCollector();

  // 1. To see if the service parameter is a client parameter.
  const client = context.getClientForOperation(operation);
  let clientParams = context.__clientParametersCache.get(client);
  if (!clientParams) {
    clientParams = [];
    context.__clientParametersCache.set(client, clientParams);
  }

  const correspondingClientParams = clientParams.filter(
    (x) =>
      compareModelProperties(context, x.__raw, serviceParam.__raw) ||
      (x.__raw?.kind === "ModelProperty" && getParamAlias(context, x.__raw) === serviceParam.name),
  );
  if (correspondingClientParams.length > 0) {
    return diagnostics.wrap(correspondingClientParams);
  }

  // 2. To see if the service parameter is api version parameter that has been elevated to client.
  if (serviceParam.isApiVersionParam && serviceParam.onClient) {
    const existingApiVersion = clientParams?.find((x) => isApiVersion(context, x.__raw!));
    if (!existingApiVersion) {
      diagnostics.add(
        createDiagnostic({
          code: "no-corresponding-method-param",
          target: operation,
          format: {
            paramName: "apiVersion",
            methodName: operation.name,
          },
        }),
      );
      return diagnostics.wrap([]);
    }
    return diagnostics.wrap(existingApiVersion ? [existingApiVersion] : []);
  }

  // 3. To see if the service parameter is subscription parameter that has been elevated to client (only for arm service).
  if (isSubscriptionId(context, serviceParam)) {
    const subId = clientParams.find((x) => isSubscriptionId(context, x));
    if (!subId) {
      diagnostics.add(
        createDiagnostic({
          code: "no-corresponding-method-param",
          target: operation,
          format: {
            paramName: "subscriptionId",
            methodName: operation.name,
          },
        }),
      );
      return diagnostics.wrap([]);
    }
    return diagnostics.wrap(subId ? [subId] : []);
  }

  // 4. To see if the service parameter is a method parameter or a property of a method parameter.
  const directMapping = findMapping(context, methodParameters, serviceParam);
  if (directMapping) {
    return diagnostics.wrap([directMapping]);
  }

  // 5. To see if all the property of the service parameter could be mapped to a method parameter or a property of a method parameter.
  if (serviceParam.kind === "body" && serviceParam.type.kind === "model") {
    const retVal = [];
    let optionalSkip = 0;
    for (const serviceParamProp of serviceParam.type.properties) {
      const propertyMapping = findMapping(context, methodParameters, serviceParamProp);
      if (propertyMapping) {
        retVal.push(propertyMapping);
      } else if (serviceParamProp.optional) {
        // If the property is optional, we can skip the mapping.
        optionalSkip++;
      }
    }
    if (retVal.length + optionalSkip === serviceParam.type.properties.length) {
      return diagnostics.wrap(retVal);
    }
  }

  // If mapping could not be found, and the service param is required, TCGC will report error since we can't generate the client code without this mapping.
  if (!serviceParam.optional) {
    diagnostics.add(
      createDiagnostic({
        code: "no-corresponding-method-param",
        target: operation,
        format: {
          paramName: serviceParam.name,
          methodName: operation.name,
        },
      }),
    );
  }

  return diagnostics.wrap([]);
}

/**
 * Try to find the mapping of a service paramete or a property of a service parameter to a method parameter or a property of a method parameter.
 * @param methodParameters
 * @param serviceParam
 * @returns
 */
function findMapping(
  context: TCGCContext,
  methodParameters: SdkMethodParameter[],
  serviceParam: SdkHttpParameter | SdkModelPropertyType,
): SdkMethodParameter | SdkModelPropertyType | undefined {
  const queue: (SdkMethodParameter | SdkModelPropertyType)[] = [...methodParameters];
  const visited: Set<SdkModelType> = new Set();
  while (queue.length > 0) {
    const methodParam = queue.shift()!;
    // HTTP operation parameter/body parameter/property of body parameter could either from an operation parameter directly or from a property of an operation parameter.
    if (
      methodParam.__raw &&
      serviceParam.__raw &&
      compareModelProperties(context, methodParam.__raw, serviceParam.__raw)
    ) {
      return methodParam;
    }
    // Two following two hard coded mapping is for the case that TCGC help to add content type and accept header when not exists.
    if (
      serviceParam.kind === "header" &&
      serviceParam.serializedName === "Content-Type" &&
      methodParam.name === "contentType"
    ) {
      return methodParam;
    }
    if (
      serviceParam.kind === "header" &&
      serviceParam.serializedName === "Accept" &&
      methodParam.name === "accept"
    ) {
      return methodParam;
    }
    // BFS to find the mapping.
    if (methodParam.type.kind === "model" && !visited.has(methodParam.type)) {
      visited.add(methodParam.type);
      let current: SdkModelType | undefined = methodParam.type;
      while (current) {
        for (const prop of methodParam.type.properties) {
          queue.push(prop);
        }
        current = current.baseModel;
      }
    }
  }
  return undefined;
}

function filterOutUselessPathParameters(
  context: TCGCContext,
  httpOperation: HttpOperation,
  methodParameters: SdkMethodParameter[],
) {
  // there are some cases that method path parameter is not in operation:
  // 1. autoroute with constant parameter
  // 2. singleton arm resource name
  // 3. visibility mis-match
  // so we will remove the method parameter for consistent
  for (let i = 0; i < methodParameters.length; i++) {
    const param = methodParameters[i];
    if (
      param.__raw &&
      isPathParam(context.program, param.__raw) &&
      httpOperation.parameters.parameters.filter(
        (p) =>
          p.type === "path" &&
          p.name === (getPathParamName(context.program, param.__raw!) ?? param.name),
      ).length === 0
    ) {
      methodParameters.splice(i, 1);
      i--;
    }
  }
}

function getCollectionFormat(
  context: TCGCContext,
  type: ModelProperty,
): [CollectionFormat | undefined, readonly Diagnostic[]] {
  const diagnostics = createDiagnosticCollector();
  const program = context.program;
  if (isHeader(program, type)) {
    return getFormatFromExplodeOrEncode(
      context,
      type,
      getHeaderFieldOptions(program, type).explode,
    );
  } else if (isQueryParam(program, type)) {
    return getFormatFromExplodeOrEncode(
      context,
      type,
      getQueryParamOptions(program, type)?.explode,
    );
  }
  return diagnostics.wrap(undefined);
}

function getFormatFromExplodeOrEncode(
  context: TCGCContext,
  type: ModelProperty,
  explode?: boolean,
): [CollectionFormat | undefined, readonly Diagnostic[]] {
  const diagnostics = createDiagnosticCollector();
  if ($(context.program).array.is(type.type)) {
    if (explode) {
      return diagnostics.wrap("multi");
    }
    const encode = getEncode(context.program, type);
    if (encode) {
      if (encode?.encoding === "ArrayEncoding.pipeDelimited") {
        return diagnostics.wrap("pipes");
      }
      if (encode?.encoding === "ArrayEncoding.spaceDelimited") {
        return diagnostics.wrap("ssv");
      }
      diagnostics.add(
        createDiagnostic({
          code: "invalid-encode-for-collection-format",
          target: type,
        }),
      );
    }
    return diagnostics.wrap("csv");
  }
  return diagnostics.wrap(undefined);
}
