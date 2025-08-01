using Reflection;

namespace Azure.ResourceManager.Legacy;

/**
 * Route options for an operation
 */
model ArmOperationOptions {
  /** Should a static route be used */
  useStaticRoute?: boolean;

  /** The status route for operations to use */
  route?: string;
}
/**
 * This decorator is used on resources that do not satisfy the definition of a resource
 * but need to be identified as such.
 */
extern dec customAzureResource(target: Model);

/**
 * Specify an external reference that should be used when emitting this type.
 * @param jsonRef - External reference(e.g. "../../common.json#/definitions/Foo")
 */
extern dec externalTypeRef(entity: Model | ModelProperty, jsonRef: valueof string);

/**
 * Signifies that an operation is an Azure Resource Manager operation
 * and optionally associates the operation with a route template.
 * @param target The operation to associate the model with
 * @param route Optional route to associate with the operation
 */
extern dec armOperationRoute(target: Operation, route?: valueof ArmOperationOptions);
