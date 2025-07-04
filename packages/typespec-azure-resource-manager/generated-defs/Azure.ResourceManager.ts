import type {
  DecoratorContext,
  EnumMember,
  EnumValue,
  Interface,
  Model,
  ModelProperty,
  Namespace,
  Operation,
  Type,
} from "@typespec/compiler";

export interface ResourceOperationOptions {
  readonly resourceType?: Record<string, unknown>;
  readonly allowStaticRoutes?: boolean;
  readonly omitTags?: boolean;
}

/**
 * Marks the operation as being a collection action
 */
export type ArmResourceCollectionActionDecorator = (
  context: DecoratorContext,
  target: Operation,
) => void;

/**
 * `@armResourceType` sets the value fo the decorated string
 * property to the type of the Azure Resource Manager resource.
 *
 * @param resource The resource to get the type of
 */
export type ArmProviderNameValueDecorator = (context: DecoratorContext, target: Operation) => void;

/**
 * `@armProviderNamespace` sets the Azure Resource Manager provider name. It will default to use the
 * Namespace element value unless an override value is specified.
 *
 * @example
 * ```typespec
 * @armProviderNamespace
 *  namespace Microsoft.Contoso;
 * ```
 *
 * ```typespec
 * @armProviderNamespace("Microsoft.Contoso")
 *  namespace Microsoft.ContosoService;
 * ```
 * @param providerNamespace Provider namespace
 * @param libraryNamespaces a library namespace containing types for this namespace
 */
export type ArmProviderNamespaceDecorator = (
  context: DecoratorContext,
  target: Namespace,
  providerNamespace?: string,
) => void;

/**
 * Declare the Azure Resource Manager library namespaces used in this provider.
 * This allows sharing Azure Resource Manager resource types across specifications
 *
 * @param namespaces The namespaces of Azure Resource Manager libraries used in this provider
 */
export type UseLibraryNamespaceDecorator = (
  context: DecoratorContext,
  target: Namespace,
  ...namespaces: Namespace[]
) => void;

/**
 * `@armLibraryNamespace` designates a namespace as containign Azure Resource Manager Provider information.
 *
 * @example
 * ```typespec
 * @armLibraryNamespace
 *  namespace Microsoft.Contoso;
 * ```
 */
export type ArmLibraryNamespaceDecorator = (context: DecoratorContext, target: Namespace) => void;

/**
 * `@singleton` marks an Azure Resource Manager resource model as a singleton resource.
 *
 * Singleton resources only have a single instance with a fixed key name.
 * `.../providers/Microsoft.Contoso/monthlyReports/default`
 *
 * See more details on [different Azure Resource Manager resource type here.](https://azure.github.io/typespec-azure/docs/howtos/ARM/resource-type)
 *
 * @param keyValue The name of the singleton resource. Default name is "default".
 */
export type SingletonDecorator = (
  context: DecoratorContext,
  target: Model,
  keyValue?: string | "default",
) => void;

/**
 * `@tenantResource` marks an Azure Resource Manager resource model as a Tenant resource/Root resource/Top-Level resource.
 *
 * Tenant resources have REST API paths like:
 * `/provider/Microsoft.Contoso/FooResources`
 *
 * See more details on [different Azure Resource Manager resource type here.](https://azure.github.io/typespec-azure/docs/howtos/ARM/resource-type)
 */
export type TenantResourceDecorator = (context: DecoratorContext, target: Model) => void;

/**
 * `@subscriptionResource` marks an Azure Resource Manager resource model as a subscription resource.
 *
 * Subscription resources have REST API paths like:
 * `/subscription/{id}/providers/Microsoft.Contoso/employees`
 *
 * See more details on [different Azure Resource Manager resource type here.](https://azure.github.io/typespec-azure/docs/howtos/ARM/resource-type)
 */
export type SubscriptionResourceDecorator = (context: DecoratorContext, target: Model) => void;

/**
 * `@locationResource` marks an Azure Resource Manager resource model as a location based resource.
 *
 * Location based resources have REST API paths like
 * `/subscriptions/{subscriptionId}/locations/{location}/providers/Microsoft.Contoso/employees`
 *
 * See more details on [different Azure Resource Manager resource type here.](https://azure.github.io/typespec-azure/docs/howtos/ARM/resource-type)
 */
export type LocationResourceDecorator = (context: DecoratorContext, target: Model) => void;

/**
 * `@resourceGroupResource` marks an Azure Resource Manager resource model as a resource group level resource.
 * This is the default option for Azure Resource Manager resources. It is provided for symmetry and clarity, and
 * you typically do not need to specify it.
 *
 * `/subscription/{id}/resourcegroups/{rg}/providers/Microsoft.Contoso/employees`
 *
 * See more details on [different Azure Resource Manager resource type here.](https://azure.github.io/typespec-azure/docs/howtos/ARM/resource-type)
 */
export type ResourceGroupResourceDecorator = (context: DecoratorContext, target: Model) => void;

/**
 * `@extensionResource` marks an Azure Resource Manager resource model as an Extension resource.
 * Extension resource extends other resource types. URL path is appended
 * to another segment {scope} which refers to another Resource URL.
 *
 * `{resourceUri}/providers/Microsoft.Contoso/accessPermissions`
 *
 * See more details on [different Azure Resource Manager resource type here.](https://azure.github.io/typespec-azure/docs/howtos/ARM/resource-type)
 */
export type ExtensionResourceDecorator = (context: DecoratorContext, target: Model) => void;

/**
 *
 *
 *
 * @param resourceType Resource model
 */
export type ArmResourceActionDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => void;

/**
 *
 *
 *
 * @param resourceType Resource model
 */
export type ArmResourceCreateOrUpdateDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => void;

/**
 *
 *
 *
 * @param resourceType Resource model
 */
export type ArmResourceReadDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => void;

/**
 *
 *
 *
 * @param resourceType Resource model
 */
export type ArmResourceUpdateDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => void;

/**
 *
 *
 *
 * @param resourceType Resource model
 */
export type ArmResourceDeleteDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => void;

/**
 *
 *
 *
 * @param resourceType Resource model
 */
export type ArmResourceListDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
) => void;

/**
 * This decorator is used to identify interfaces containing resource operations.
 * By default, it marks the interface with the `@autoRoute` decorator so that
 * all of its contained operations will have their routes generated
 * automatically.
 *
 * The decorator also adds a `@tag` decorator bearing the name of the interface so that all
 * of the operations will be grouped based on the interface name in generated
 * clients.
 *
 * The optional `resourceOperationOptions` parameter provides additional options.
 * `allowStaticRoutes` turns off autoRout for the interface, so individual operations can
 * choose static (`@route`) or automatic (`@autoRoute`) routing.
 *
 * `resourceType: Model` specifies the resource type for the operations in the interface
 *
 * `omitTags: true`: turns off the default tagging of operations in the interface, so that individual operations must be
 * individually tagged
 *
 * @param resourceOperationOptions Options for routing the operations in the interface and associating them with a specific resource
 */
export type ArmResourceOperationsDecorator = (
  context: DecoratorContext,
  target: Interface,
  resourceOperationOptions?: Type | ResourceOperationOptions,
) => void;

/**
 * This decorator is used either on a namespace or a version enum value to indicate
 * the version of the Azure Resource Manager common-types to use for refs in emitted Swagger files.
 *
 * @param version The Azure.ResourceManager.CommonTypes.Versions for the desired common-types version or an equivalent string value like "v5".
 */
export type ArmCommonTypesVersionDecorator = (
  context: DecoratorContext,
  target: Namespace | EnumMember,
  version: string | EnumValue,
) => void;

/**
 * This decorator is used on Azure Resource Manager resources that are not based on
 * Azure.ResourceManager common types.
 *
 * @param propertiesType : The type of the resource properties.
 */
export type ArmVirtualResourceDecorator = (
  context: DecoratorContext,
  target: Model,
  provider?: string,
) => void;

/**
 * This decorator sets the base type of the given resource.
 *
 * @param baseType The built-in parent of the resource, this can be "Tenant", "Subscription", "ResourceGroup", "Location", or "Extension"
 */
export type ResourceBaseTypeDecorator = (
  context: DecoratorContext,
  target: Model,
  baseTypeIt: Type,
) => void;

/**
 * This decorator is used to indicate the identifying properties of objects in the array, e.g. size
 * The properties that are used as identifiers for the object needs to be provided as a list of strings.
 *
 * @param properties The list of properties that are used as identifiers for the object. This needs to be provided as a list of strings.
 * @example
 * ```typespec
 * model Pet {
 *  @identifiers(#["size"])
 *  dog: Dog;
 * }
 * ```
 */
export type IdentifiersDecorator = (
  context: DecoratorContext,
  entity: ModelProperty,
  properties: readonly string[],
) => void;

export type AzureResourceManagerDecorators = {
  armResourceCollectionAction: ArmResourceCollectionActionDecorator;
  armProviderNameValue: ArmProviderNameValueDecorator;
  armProviderNamespace: ArmProviderNamespaceDecorator;
  useLibraryNamespace: UseLibraryNamespaceDecorator;
  armLibraryNamespace: ArmLibraryNamespaceDecorator;
  singleton: SingletonDecorator;
  tenantResource: TenantResourceDecorator;
  subscriptionResource: SubscriptionResourceDecorator;
  locationResource: LocationResourceDecorator;
  resourceGroupResource: ResourceGroupResourceDecorator;
  extensionResource: ExtensionResourceDecorator;
  armResourceAction: ArmResourceActionDecorator;
  armResourceCreateOrUpdate: ArmResourceCreateOrUpdateDecorator;
  armResourceRead: ArmResourceReadDecorator;
  armResourceUpdate: ArmResourceUpdateDecorator;
  armResourceDelete: ArmResourceDeleteDecorator;
  armResourceList: ArmResourceListDecorator;
  armResourceOperations: ArmResourceOperationsDecorator;
  armCommonTypesVersion: ArmCommonTypesVersionDecorator;
  armVirtualResource: ArmVirtualResourceDecorator;
  resourceBaseType: ResourceBaseTypeDecorator;
  identifiers: IdentifiersDecorator;
};
