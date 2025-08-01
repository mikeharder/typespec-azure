import {
  $doc,
  DecoratorContext,
  getFriendlyName,
  ignoreDiagnostics,
  Model,
  Operation,
  Program,
} from "@typespec/compiler";
import { useStateMap } from "@typespec/compiler/utils";
import { $route, getHttpOperation, HttpOperation } from "@typespec/http";
import {
  $actionSegment,
  $autoRoute,
  $createsOrReplacesResource,
  $deletesResource,
  $readsResource,
  $updatesResource,
  getActionSegment,
  getParentResource,
  getSegment,
} from "@typespec/rest";
import {
  ArmResourceActionDecorator,
  ArmResourceCollectionActionDecorator,
  ArmResourceCreateOrUpdateDecorator,
  ArmResourceDeleteDecorator,
  ArmResourceListDecorator,
  ArmResourceReadDecorator,
  ArmResourceUpdateDecorator,
} from "../generated-defs/Azure.ResourceManager.js";
import {
  ArmOperationOptions,
  ArmOperationRouteDecorator,
} from "../generated-defs/Azure.ResourceManager.Legacy.js";
import { reportDiagnostic } from "./lib.js";
import { isArmLibraryNamespace } from "./namespace.js";
import {
  getArmResourceInfo,
  getResourceBaseType,
  isArmVirtualResource,
  isCustomAzureResource,
  ResourceBaseType,
} from "./resource.js";
import { ArmStateKeys } from "./state.js";

export type ArmLifecycleOperationKind = "read" | "createOrUpdate" | "update" | "delete";
export type ArmOperationKind = ArmLifecycleOperationKind | "list" | "action" | "other";

export interface ArmResourceOperation extends ArmResourceOperationData {
  path: string;
  httpOperation: HttpOperation;
}

export interface ArmLifecycleOperations {
  read?: ArmResourceOperation;
  createOrUpdate?: ArmResourceOperation;
  update?: ArmResourceOperation;
  delete?: ArmResourceOperation;
}

export interface ArmResourceLifecycleOperations {
  read?: ArmResourceOperation[];
  createOrUpdate?: ArmResourceOperation[];
  update?: ArmResourceOperation[];
  delete?: ArmResourceOperation[];
}

export interface ArmResolvedOperationsForResource {
  lifecycle: ArmResourceLifecycleOperations;
  lists: ArmResourceOperation[];
  actions: ArmResourceOperation[];
}

export interface ArmResourceOperations {
  lifecycle: ArmLifecycleOperations;
  lists: { [key: string]: ArmResourceOperation };
  actions: { [key: string]: ArmResourceOperation };
}

interface ArmResourceOperationData {
  name: string;
  kind: ArmOperationKind;
  operation: Operation;
  operationGroup: string;
}

/** Identifying information for an arm operation */
interface ArmOperationIdentifier {
  name: string;
  kind: ArmOperationKind;
  operationGroup: string;
  operation: Operation;
  resource?: Model;
}

interface ArmLifecycleOperationData {
  read?: ArmResourceOperationData;
  createOrUpdate?: ArmResourceOperationData;
  update?: ArmResourceOperationData;
  delete?: ArmResourceOperationData;
}

interface ArmResourceOperationsData {
  lifecycle: ArmLifecycleOperationData;
  lists: { [key: string]: ArmResourceOperationData };
  actions: { [key: string]: ArmResourceOperationData };
}

function getArmResourceOperations(
  program: Program,
  resourceType: Model,
): ArmResourceOperationsData {
  let operations = program.stateMap(ArmStateKeys.armResourceOperations).get(resourceType);
  if (!operations) {
    operations = { lifecycle: {}, lists: {}, actions: {} };
    program.stateMap(ArmStateKeys.armResourceOperations).set(resourceType, operations);
  }

  return operations;
}

function resolveHttpOperations<T extends Record<string, ArmResourceOperationData>>(
  program: Program,
  data: T,
): Record<keyof T, ArmResourceOperation> {
  const result: Record<string, ArmResourceOperation> = {};
  for (const [key, item] of Object.entries(data)) {
    const httpOperation: HttpOperation = ignoreDiagnostics(
      getHttpOperation(program, item.operation),
    );
    result[key] = {
      ...item,
      path: httpOperation.path,
      httpOperation: httpOperation,
    };
  }
  return result as any;
}

export function resolveResourceOperations(
  program: Program,
  resourceType: Model,
): ArmResourceOperations {
  const operations = getArmResourceOperations(program, resourceType);

  // Returned the updated operations object
  return {
    lifecycle: resolveHttpOperations(
      program,
      operations.lifecycle as Record<string, ArmResourceOperationData>,
    ),
    actions: resolveHttpOperations(program, operations.actions),
    lists: resolveHttpOperations(program, operations.lists),
  };
}

function setResourceLifecycleOperation(
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
  kind: ArmLifecycleOperationKind,
) {
  // Only register methods from non-templated interface types
  if (
    target.interface === undefined ||
    target.interface.node === undefined ||
    target.interface.node.templateParameters.length > 0
  ) {
    return;
  }

  // We can't resolve the operation path yet so treat the operation as a partial
  // type so that we can fill in the missing details later
  const operations = getArmResourceOperations(context.program, resourceType);
  const operation: Partial<ArmResourceOperation> = {
    name: target.name,
    kind,
    operation: target,
    operationGroup: target.interface.name,
  };

  operations.lifecycle[kind] = operation as ArmResourceOperation;
  setArmOperationIdentifier(context.program, target, resourceType, {
    name: target.name,
    kind: kind,
    operation: target,
    operationGroup: target.interface.name,
  });
}

export const [getArmOperationList, setArmOperationList] = useStateMap<
  Model,
  Set<ArmOperationIdentifier>
>(ArmStateKeys.resourceOperationList);

export function getArmResourceOperationList(
  program: Program,
  resourceType: Model,
): Set<ArmOperationIdentifier> {
  let operations = getArmOperationList(program, resourceType);
  if (operations === undefined) {
    operations = new Set<ArmOperationIdentifier>();
    setArmOperationList(program, resourceType, operations);
  }
  return operations;
}

export function addArmResourceOperation(
  program: Program,
  resourceType: Model,
  operationData: ArmOperationIdentifier,
): void {
  const operations = getArmResourceOperationList(program, resourceType);
  operations.add(operationData);
  setArmOperationList(program, resourceType, operations);
}

export const [getArmResourceOperationData, setArmResourceOperationData] = useStateMap<
  Operation,
  ArmResourceOperationData
>(ArmStateKeys.armResourceOperationData);

export function setArmOperationIdentifier(
  program: Program,
  target: Operation,
  resourceType: Model,
  data: ArmResourceOperationData,
): void {
  const operationId: ArmOperationIdentifier = {
    name: data.name,
    kind: data.kind,
    operation: target,
    operationGroup: data.operationGroup,
    resource: resourceType,
  };
  // Initialize the operations for the resource type if not already done
  if (!getArmResourceOperationData(program, target)) {
    setArmResourceOperationData(program, target, operationId);
  }
  addArmResourceOperation(program, resourceType, operationId);
}

export const $armResourceRead: ArmResourceReadDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => {
  context.call($readsResource, target, resourceType);
  setResourceLifecycleOperation(context, target, resourceType, "read");
};

export const $armResourceCreateOrUpdate: ArmResourceCreateOrUpdateDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => {
  context.call($createsOrReplacesResource, target, resourceType);
  setResourceLifecycleOperation(context, target, resourceType, "createOrUpdate");
};

export const $armResourceUpdate: ArmResourceUpdateDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => {
  context.call($updatesResource, target, resourceType);
  setResourceLifecycleOperation(context, target, resourceType, "update");
};

export const $armResourceDelete: ArmResourceDeleteDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => {
  context.call($deletesResource, target, resourceType);
  setResourceLifecycleOperation(context, target, resourceType, "delete");
};

export const $armResourceList: ArmResourceListDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => {
  // Only register methods from non-templated interface types
  if (
    target.interface === undefined ||
    target.interface.node === undefined ||
    target.interface.node.templateParameters.length > 0
  ) {
    return;
  }

  // We can't resolve the operation path yet so treat the operation as a partial
  // type so that we can fill in the missing details later
  const operations = getArmResourceOperations(context.program, resourceType);
  const operation: Partial<ArmResourceOperation> = {
    name: target.name,
    kind: "list",
    operation: target,
    operationGroup: target.interface.name,
  };

  operations.lists[target.name] = operation as ArmResourceOperation;
  addArmResourceOperation(context.program, resourceType, {
    name: target.name,
    kind: "list",
    operation: target,
    operationGroup: target.interface.name,
    resource: resourceType,
  });
  setArmOperationIdentifier(context.program, target, resourceType, {
    name: target.name,
    kind: "list",
    operation: target,
    operationGroup: target.interface.name,
  });
};

export function armRenameListByOperationInternal(
  context: DecoratorContext,
  entity: Operation,
  resourceType: Model,
  parentTypeName?: string,
  parentFriendlyTypeName?: string,
  applyOperationRename?: boolean,
) {
  const { program } = context;
  if (
    parentTypeName === undefined ||
    parentTypeName === "" ||
    parentFriendlyTypeName === undefined ||
    parentFriendlyTypeName === ""
  ) {
    [parentTypeName, parentFriendlyTypeName] = getArmParentName(context.program, resourceType);
  }
  const parentType = getParentResource(program, resourceType);
  if (
    parentType &&
    !isArmVirtualResource(program, parentType) &&
    !isCustomAzureResource(program, parentType)
  ) {
    const parentResourceInfo = getArmResourceInfo(program, parentType);
    if (
      !parentResourceInfo &&
      resourceType.namespace !== undefined &&
      isArmLibraryNamespace(program, resourceType.namespace)
    )
      return;
    if (!parentResourceInfo) {
      reportDiagnostic(program, {
        code: "parent-type",
        messageId: "notResourceType",
        target: resourceType,
        format: { type: resourceType.name, parent: parentType.name },
      });
      return;
    }

    // Make sure the first character of the name is upper-cased
    parentTypeName = parentType.name[0].toUpperCase() + parentType.name.substring(1);
  }

  // Add a formatted doc string too
  context.call(
    $doc,
    entity,
    `List ${resourceType.name} resources by ${
      parentType ? parentTypeName : parentFriendlyTypeName
    }`,
    undefined as any,
  );

  if (applyOperationRename === undefined || applyOperationRename === true) {
    // Set the operation name
    entity.name =
      parentTypeName === "Extension" || parentTypeName === undefined || parentTypeName.length < 1
        ? "list"
        : `listBy${parentTypeName}`;
  }
}

function getArmParentName(program: Program, resource: Model): string[] {
  const parent = getParentResource(program, resource);
  if (parent && (isArmVirtualResource(program, parent) || isCustomAzureResource(program, parent))) {
    const parentName = getFriendlyName(program, parent) ?? parent.name;
    if (parentName === undefined || parentName.length < 2) {
      return ["", ""];
    }
    return [
      parentName,
      parentName.length > 1 ? parentName.charAt(0).toLowerCase() + parentName.substring(1) : "",
    ];
  }
  switch (getResourceBaseType(program, resource)) {
    case ResourceBaseType.Extension:
      return ["Extension", "parent"];
    case ResourceBaseType.Location:
      return ["Location", "location"];
    case ResourceBaseType.Subscription:
      return ["Subscription", "subscription"];
    case ResourceBaseType.Tenant:
      return ["Tenant", "tenant"];
    case ResourceBaseType.ResourceGroup:
    default:
      return ["ResourceGroup", "resource group"];
  }
}

export const $armResourceAction: ArmResourceActionDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => {
  const { program } = context;

  // Only register methods from non-templated interface types
  if (
    target.interface === undefined ||
    target.interface.node === undefined ||
    target.interface.node.templateParameters.length > 0
  ) {
    return;
  }

  // We can't resolve the operation path yet so treat the operation as a partial
  // type so that we can fill in the missing details later
  const operations = getArmResourceOperations(program, resourceType);
  const operation: Partial<ArmResourceOperation> = {
    name: target.name,
    kind: "action",
    operation: target,
    operationGroup: target.interface.name,
  };

  operations.actions[target.name] = operation as ArmResourceOperation;
  addArmResourceOperation(program, resourceType, {
    name: target.name,
    kind: "action",
    operation: target,
    operationGroup: target.interface.name,
    resource: resourceType,
  });
  setArmOperationIdentifier(context.program, target, resourceType, {
    name: target.name,
    kind: "action",
    operation: target,
    operationGroup: target.interface.name,
  });

  const segment = getSegment(program, target) ?? getActionSegment(program, target);
  if (!segment) {
    // Also apply the @actionSegment decorator to the operation
    context.call($actionSegment, target, uncapitalize(target.name));
  }
};

function uncapitalize(name: string): string {
  if (name === "") {
    return name;
  }
  return name[0].toLowerCase() + name.substring(1);
}

export const $armResourceCollectionAction: ArmResourceCollectionActionDecorator = (
  context: DecoratorContext,
  target: Operation,
) => {
  context.program.stateMap(ArmStateKeys.armResourceCollectionAction).set(target, true);
};

export function isArmCollectionAction(program: Program, target: Operation): boolean {
  return program.stateMap(ArmStateKeys.armResourceCollectionAction).get(target) === true;
}

export const $armOperationRoute: ArmOperationRouteDecorator = (
  context: DecoratorContext,
  target: Operation,
  options?: ArmOperationOptions,
) => {
  const route: string | undefined = options?.route;

  if (!route && !options?.useStaticRoute) {
    context.call($autoRoute, target);
    return;
  }
  if (route && route.length > 0) {
    context.call($route, target, route);
  }
};

export function getRouteOptions(program: Program, target: Operation): ArmOperationOptions {
  let options: ArmOperationOptions | undefined = undefined;
  if (target.interface) {
    options = options || program.stateMap(ArmStateKeys.armResourceRoute).get(target.interface);
    if (options) return options;
  }
  if (target.sourceOperation?.interface) {
    options =
      options ||
      program.stateMap(ArmStateKeys.armResourceRoute).get(target.sourceOperation.interface);
  }
  if (target.sourceOperation?.interface?.sourceInterfaces[0]) {
    options =
      options ||
      program
        .stateMap(ArmStateKeys.armResourceRoute)
        .get(target.sourceOperation.interface.sourceInterfaces[0]);
  }

  if (options) return options;
  return {
    useStaticRoute: false,
  };
}
