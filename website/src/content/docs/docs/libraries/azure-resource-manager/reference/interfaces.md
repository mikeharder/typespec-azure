---
title: "Interfaces and Operations"
---

## Azure.ResourceManager

### `ExtensionResourceCollectionOperations` {#Azure.ResourceManager.ExtensionResourceCollectionOperations}

A composite interface for resource collections that include a paginated list operation.

```typespec
interface Azure.ResourceManager.ExtensionResourceCollectionOperations<Resource>
```

#### Template Parameters

| Name     | Description                                    |
| -------- | ---------------------------------------------- |
| Resource | The ArmResource that provides these operations |

#### `ExtensionResourceCollectionOperations.listByParent` {#Azure.ResourceManager.ExtensionResourceCollectionOperations.listByParent}

```typespec
op Azure.ResourceManager.ExtensionResourceCollectionOperations.listByParent(apiVersion: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ExtensionResourceInstanceOperations` {#Azure.ResourceManager.ExtensionResourceInstanceOperations}

A composite interface for resources that includes CRUD operations.

```typespec
interface Azure.ResourceManager.ExtensionResourceInstanceOperations<Resource, Properties>
```

#### Template Parameters

| Name       | Description                                    |
| ---------- | ---------------------------------------------- |
| Resource   | The ArmResource that provides these operations |
| Properties | RP-specific property bag for the resource      |

#### `ExtensionResourceInstanceOperations.get` {#Azure.ResourceManager.ExtensionResourceInstanceOperations.get}

```typespec
op Azure.ResourceManager.ExtensionResourceInstanceOperations.get(apiVersion: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ExtensionResourceInstanceOperations.createOrUpdate` {#Azure.ResourceManager.ExtensionResourceInstanceOperations.createOrUpdate}

```typespec
op Azure.ResourceManager.ExtensionResourceInstanceOperations.createOrUpdate(apiVersion: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Azure.ResourceManager.ArmResourceUpdatedResponse<Resource> | Azure.ResourceManager.ArmResourceCreatedResponse<Resource, LroHeaders> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ExtensionResourceInstanceOperations.update` {#Azure.ResourceManager.ExtensionResourceInstanceOperations.update}

```typespec
op Azure.ResourceManager.ExtensionResourceInstanceOperations.update(apiVersion: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced", properties: Azure.ResourceManager.Foundations.ResourceUpdateModel<Resource, Properties>): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ExtensionResourceInstanceOperations.delete` {#Azure.ResourceManager.ExtensionResourceInstanceOperations.delete}

```typespec
op Azure.ResourceManager.ExtensionResourceInstanceOperations.delete(apiVersion: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmDeletedResponse | Azure.ResourceManager.ArmDeleteAcceptedLroResponse<Azure.ResourceManager.{ location: string, retryAfter: int32 }> | Azure.ResourceManager.ArmDeletedNoContentResponse | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ExtensionResourceOperations` {#Azure.ResourceManager.ExtensionResourceOperations}

A composite interface for resources that include CRUD and list operations.

```typespec
interface Azure.ResourceManager.ExtensionResourceOperations<Resource, Properties>
```

#### Template Parameters

| Name       | Description                                    |
| ---------- | ---------------------------------------------- |
| Resource   | The ArmResource that provides these operations |
| Properties | RP-specific property bag for the resource      |

#### `ExtensionResourceOperations.get` {#Azure.ResourceManager.ExtensionResourceOperations.get}

```typespec
op Azure.ResourceManager.ExtensionResourceOperations.get(apiVersion: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ExtensionResourceOperations.createOrUpdate` {#Azure.ResourceManager.ExtensionResourceOperations.createOrUpdate}

```typespec
op Azure.ResourceManager.ExtensionResourceOperations.createOrUpdate(apiVersion: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Azure.ResourceManager.ArmResourceUpdatedResponse<Resource> | Azure.ResourceManager.ArmResourceCreatedResponse<Resource, LroHeaders> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ExtensionResourceOperations.update` {#Azure.ResourceManager.ExtensionResourceOperations.update}

```typespec
op Azure.ResourceManager.ExtensionResourceOperations.update(apiVersion: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced", properties: Azure.ResourceManager.Foundations.ResourceUpdateModel<Resource, Properties>): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ExtensionResourceOperations.delete` {#Azure.ResourceManager.ExtensionResourceOperations.delete}

```typespec
op Azure.ResourceManager.ExtensionResourceOperations.delete(apiVersion: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmDeletedResponse | Azure.ResourceManager.ArmDeleteAcceptedLroResponse<Azure.ResourceManager.{ location: string, retryAfter: int32 }> | Azure.ResourceManager.ArmDeletedNoContentResponse | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ExtensionResourceOperations.listByParent` {#Azure.ResourceManager.ExtensionResourceOperations.listByParent}

```typespec
op Azure.ResourceManager.ExtensionResourceOperations.listByParent(apiVersion: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `Operations` {#Azure.ResourceManager.Operations}

This is the interface that implements the standard Azure Resource Manager operation that returns
all supported RP operations. You should have exactly one declaration for each
Azure Resource Manager service. It implements
GET "/providers/Microsoft.ContosoProviderHub/operations"

```typespec
interface Azure.ResourceManager.Operations<>
```

#### `Operations.list` {#Azure.ResourceManager.Operations.list}

List the operations for the provider

```typespec
op Azure.ResourceManager.Operations.list(apiVersion: string, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.CommonTypes.OperationListResult> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ProxyResourceOperations` {#Azure.ResourceManager.ProxyResourceOperations}

A composite interface for Proxy resources that include `ResourceInstanceOperations<Resource, Properties>`
and `ResourceListByParent<Resource>`. It includes: `GET`, `PUT`, `PATCH`, `DELETE`, ListByParent operations.

The actual route depends on the resource model but would have started with
`/subscriptions/{id}/resourcegroups/{rg}/providers/Microsoft.XXX/...`

This is the most common API pattern for Proxy Resources to use.

```typespec
interface Azure.ResourceManager.ProxyResourceOperations<Resource, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | the ArmResource that provides these operations   |
| BaseParameters | The http parameters that are part of the request |

#### `ProxyResourceOperations.get` {#Azure.ResourceManager.ProxyResourceOperations.get}

```typespec
op Azure.ResourceManager.ProxyResourceOperations.get(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ProxyResourceOperations.createOrUpdate` {#Azure.ResourceManager.ProxyResourceOperations.createOrUpdate}

```typespec
op Azure.ResourceManager.ProxyResourceOperations.createOrUpdate(provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Azure.ResourceManager.ArmResourceUpdatedResponse<Resource> | Azure.ResourceManager.ArmResourceCreatedResponse<Resource, LroHeaders> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ProxyResourceOperations.delete` {#Azure.ResourceManager.ProxyResourceOperations.delete}

```typespec
op Azure.ResourceManager.ProxyResourceOperations.delete(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmDeletedResponse | Azure.ResourceManager.ArmDeleteAcceptedLroResponse<Azure.ResourceManager.{ location: string, retryAfter: int32 }> | Azure.ResourceManager.ArmDeletedNoContentResponse | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ProxyResourceOperations.listByParent` {#Azure.ResourceManager.ProxyResourceOperations.listByParent}

```typespec
op Azure.ResourceManager.ProxyResourceOperations.listByParent(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceCollectionOperations` {#Azure.ResourceManager.ResourceCollectionOperations}

A composite interface for resource collections.

```typespec
interface Azure.ResourceManager.ResourceCollectionOperations<Resource, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | The ArmResource that provides these operations   |
| BaseParameters | The http parameters that are part of the request |

#### `ResourceCollectionOperations.listByParent` {#Azure.ResourceManager.ResourceCollectionOperations.listByParent}

```typespec
op Azure.ResourceManager.ResourceCollectionOperations.listByParent(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ResourceCollectionOperations.listBySubscription` {#Azure.ResourceManager.ResourceCollectionOperations.listBySubscription}

```typespec
op Azure.ResourceManager.ResourceCollectionOperations.listBySubscription(apiVersion: string, subscriptionId: Azure.Core.uuid, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceCreateAsync` {#Azure.ResourceManager.ResourceCreateAsync}

A composite interface for resources that include a long-running create or update operation.

```typespec
interface Azure.ResourceManager.ResourceCreateAsync<Resource, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | The ArmResource that provides these operations   |
| BaseParameters | The http parameters that are part of the request |

#### `ResourceCreateAsync.createOrUpdate` {#Azure.ResourceManager.ResourceCreateAsync.createOrUpdate}

```typespec
op Azure.ResourceManager.ResourceCreateAsync.createOrUpdate(provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Azure.ResourceManager.ArmResourceUpdatedResponse<Resource> | Azure.ResourceManager.ArmResourceCreatedResponse<Resource, LroHeaders> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceCreateSync` {#Azure.ResourceManager.ResourceCreateSync}

A composite interface for resources that include a synchronous create or update operation.

```typespec
interface Azure.ResourceManager.ResourceCreateSync<Resource, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | The ArmResource that provides these operations   |
| BaseParameters | The http parameters that are part of the request |

#### `ResourceCreateSync.createOrUpdate` {#Azure.ResourceManager.ResourceCreateSync.createOrUpdate}

```typespec
op Azure.ResourceManager.ResourceCreateSync.createOrUpdate(provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Azure.ResourceManager.ArmResourceUpdatedResponse<Resource> | Azure.ResourceManager.ArmResourceCreatedSyncResponse<Resource> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceDeleteAsync` {#Azure.ResourceManager.ResourceDeleteAsync}

:::caution
**Deprecated**: This should be deprecated in a future release
:::

```typespec
interface Azure.ResourceManager.ResourceDeleteAsync<Resource, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | The ArmResource that provides these operations   |
| BaseParameters | The http parameters that are part of the request |

#### `ResourceDeleteAsync.delete` {#Azure.ResourceManager.ResourceDeleteAsync.delete}

```typespec
op Azure.ResourceManager.ResourceDeleteAsync.delete(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmDeletedResponse | Azure.ResourceManager.ArmDeleteAcceptedLroResponse<Azure.ResourceManager.{ location: string, retryAfter: int32 }> | Azure.ResourceManager.ArmDeletedNoContentResponse | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceDeleteSync` {#Azure.ResourceManager.ResourceDeleteSync}

A composite interface for resources that include a synchronous delete operation.

```typespec
interface Azure.ResourceManager.ResourceDeleteSync<Resource, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | The ArmResource that provides these operations   |
| BaseParameters | The http parameters that are part of the request |

#### `ResourceDeleteSync.delete` {#Azure.ResourceManager.ResourceDeleteSync.delete}

```typespec
op Azure.ResourceManager.ResourceDeleteSync.delete(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmDeletedResponse | Azure.ResourceManager.ArmDeletedNoContentResponse | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceDeleteWithoutOkAsync` {#Azure.ResourceManager.ResourceDeleteWithoutOkAsync}

```typespec
interface Azure.ResourceManager.ResourceDeleteWithoutOkAsync<Resource, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | The ArmResource that provides these operations   |
| BaseParameters | The http parameters that are part of the request |

#### `ResourceDeleteWithoutOkAsync.delete` {#Azure.ResourceManager.ResourceDeleteWithoutOkAsync.delete}

```typespec
op Azure.ResourceManager.ResourceDeleteWithoutOkAsync.delete(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmDeleteAcceptedLroResponse<Azure.ResourceManager.{ location: string, retryAfter: int32 }> | Azure.ResourceManager.ArmDeletedNoContentResponse | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceInstanceOperations` {#Azure.ResourceManager.ResourceInstanceOperations}

A composite interface for resources that have CRUD operations.

```typespec
interface Azure.ResourceManager.ResourceInstanceOperations<Resource, Properties, BaseParameters, PatchModel>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | The ArmResource that provides these operations   |
| Properties     | RP-specific property bag for the resource        |
| BaseParameters | The http parameters that are part of the request |
| PatchModel     | The model used for PATCH operations              |

#### `ResourceInstanceOperations.get` {#Azure.ResourceManager.ResourceInstanceOperations.get}

```typespec
op Azure.ResourceManager.ResourceInstanceOperations.get(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ResourceInstanceOperations.createOrUpdate` {#Azure.ResourceManager.ResourceInstanceOperations.createOrUpdate}

```typespec
op Azure.ResourceManager.ResourceInstanceOperations.createOrUpdate(provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Azure.ResourceManager.ArmResourceUpdatedResponse<Resource> | Azure.ResourceManager.ArmResourceCreatedResponse<Resource, LroHeaders> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ResourceInstanceOperations.update` {#Azure.ResourceManager.ResourceInstanceOperations.update}

```typespec
op Azure.ResourceManager.ResourceInstanceOperations.update(provider: "Microsoft.ThisWillBeReplaced", properties: Azure.ResourceManager.Foundations.ResourceUpdateModel<Resource, Properties>): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ResourceInstanceOperations.delete` {#Azure.ResourceManager.ResourceInstanceOperations.delete}

```typespec
op Azure.ResourceManager.ResourceInstanceOperations.delete(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmDeletedResponse | Azure.ResourceManager.ArmDeleteAcceptedLroResponse<Azure.ResourceManager.{ location: string, retryAfter: int32 }> | Azure.ResourceManager.ArmDeletedNoContentResponse | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceListByParent` {#Azure.ResourceManager.ResourceListByParent}

An interface for resources which can be listed by parent.

```typespec
interface Azure.ResourceManager.ResourceListByParent<Resource, BaseParameters, ParentName, ParentFriendlyName>
```

#### Template Parameters

| Name               | Description                                      |
| ------------------ | ------------------------------------------------ |
| Resource           | The ArmResource that provides these operations   |
| BaseParameters     | The http parameters that are part of the request |
| ParentName         | The name of the parent resource                  |
| ParentFriendlyName | The friendly name of the parent resource         |

#### `ResourceListByParent.listByParent` {#Azure.ResourceManager.ResourceListByParent.listByParent}

```typespec
op Azure.ResourceManager.ResourceListByParent.listByParent(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceListBySubscription` {#Azure.ResourceManager.ResourceListBySubscription}

An interface for resources with can be listed by subscription.

```typespec
interface Azure.ResourceManager.ResourceListBySubscription<Resource>
```

#### Template Parameters

| Name     | Description                                    |
| -------- | ---------------------------------------------- |
| Resource | The ArmResource that provides these operations |

#### `ResourceListBySubscription.listBySubscription` {#Azure.ResourceManager.ResourceListBySubscription.listBySubscription}

```typespec
op Azure.ResourceManager.ResourceListBySubscription.listBySubscription(apiVersion: string, subscriptionId: Azure.Core.uuid, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceOperations` {#Azure.ResourceManager.ResourceOperations}

:::caution
**Deprecated**: Use Azure.ResourceManager.TrackedResourceOperations instead
:::

```typespec
interface Azure.ResourceManager.ResourceOperations<Resource, Properties, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | the ArmResource that provides these operations   |
| Properties     | RP-specific property bag for the resource        |
| BaseParameters | The http parameters that are part of the request |

#### `ResourceOperations.get` {#Azure.ResourceManager.ResourceOperations.get}

```typespec
op Azure.ResourceManager.ResourceOperations.get(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ResourceOperations.createOrUpdate` {#Azure.ResourceManager.ResourceOperations.createOrUpdate}

```typespec
op Azure.ResourceManager.ResourceOperations.createOrUpdate(provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Azure.ResourceManager.ArmResourceUpdatedResponse<Resource> | Azure.ResourceManager.ArmResourceCreatedResponse<Resource, LroHeaders> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ResourceOperations.update` {#Azure.ResourceManager.ResourceOperations.update}

```typespec
op Azure.ResourceManager.ResourceOperations.update(provider: "Microsoft.ThisWillBeReplaced", properties: Azure.ResourceManager.Foundations.ResourceUpdateModel<Resource, Properties>): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ResourceOperations.delete` {#Azure.ResourceManager.ResourceOperations.delete}

```typespec
op Azure.ResourceManager.ResourceOperations.delete(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmDeletedResponse | Azure.ResourceManager.ArmDeleteAcceptedLroResponse<Azure.ResourceManager.{ location: string, retryAfter: int32 }> | Azure.ResourceManager.ArmDeletedNoContentResponse | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ResourceOperations.listByParent` {#Azure.ResourceManager.ResourceOperations.listByParent}

```typespec
op Azure.ResourceManager.ResourceOperations.listByParent(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `ResourceOperations.listBySubscription` {#Azure.ResourceManager.ResourceOperations.listBySubscription}

```typespec
op Azure.ResourceManager.ResourceOperations.listBySubscription(apiVersion: string, subscriptionId: Azure.Core.uuid, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceRead` {#Azure.ResourceManager.ResourceRead}

A composite interface for resources that include a GET operation.

```typespec
interface Azure.ResourceManager.ResourceRead<Resource, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | The ArmResource that provides these operations   |
| BaseParameters | The http parameters that are part of the request |

#### `ResourceRead.get` {#Azure.ResourceManager.ResourceRead.get}

```typespec
op Azure.ResourceManager.ResourceRead.get(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceUpdateAsync` {#Azure.ResourceManager.ResourceUpdateAsync}

```typespec
interface Azure.ResourceManager.ResourceUpdateAsync<Resource, Properties, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | The ArmResource that provides these operations   |
| Properties     | RP-specific property bag for the resource        |
| BaseParameters | The http parameters that are part of the request |

#### `ResourceUpdateAsync.update` {#Azure.ResourceManager.ResourceUpdateAsync.update}

```typespec
op Azure.ResourceManager.ResourceUpdateAsync.update(provider: "Microsoft.ThisWillBeReplaced", properties: Azure.ResourceManager.Foundations.ResourceUpdateModel<Resource, Properties>): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.ArmAcceptedLroResponse<"Resource update request accepted.", Azure.ResourceManager.{ location: string, retryAfter: int32 }> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ResourceUpdateSync` {#Azure.ResourceManager.ResourceUpdateSync}

A composite interface for resources that include a synchronous update operation.

```typespec
interface Azure.ResourceManager.ResourceUpdateSync<Resource, Properties, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | The ArmResource that provides these operations   |
| Properties     | RP-specific property bag for the resource        |
| BaseParameters | The http parameters that are part of the request |

#### `ResourceUpdateSync.update` {#Azure.ResourceManager.ResourceUpdateSync.update}

```typespec
op Azure.ResourceManager.ResourceUpdateSync.update(provider: "Microsoft.ThisWillBeReplaced", properties: Azure.ResourceManager.Foundations.ResourceUpdateModel<Resource, Properties>): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `TenantResourceOperations` {#Azure.ResourceManager.TenantResourceOperations}

A composite interface for Tenant resources that include `ResourceInstanceOperations<Resource, Properties>`
and `ResourceListByParent<Resource>`. It includes: `GET`, `PUT`, `PATCH`, `DELETE`, ListByParent operations.

The routes are always start at root level:
`/providers/Microsoft.XXX/...`

This is the most common API pattern for Tenant Resources to use.

```typespec
interface Azure.ResourceManager.TenantResourceOperations<Resource, Properties>
```

#### Template Parameters

| Name       | Description                                    |
| ---------- | ---------------------------------------------- |
| Resource   | the ArmResource that provides these operations |
| Properties | RP-specific property bag for the resource      |

#### `TenantResourceOperations.get` {#Azure.ResourceManager.TenantResourceOperations.get}

```typespec
op Azure.ResourceManager.TenantResourceOperations.get(apiVersion: string, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `TenantResourceOperations.createOrUpdate` {#Azure.ResourceManager.TenantResourceOperations.createOrUpdate}

```typespec
op Azure.ResourceManager.TenantResourceOperations.createOrUpdate(apiVersion: string, provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Azure.ResourceManager.ArmResourceUpdatedResponse<Resource> | Azure.ResourceManager.ArmResourceCreatedResponse<Resource, LroHeaders> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `TenantResourceOperations.update` {#Azure.ResourceManager.TenantResourceOperations.update}

```typespec
op Azure.ResourceManager.TenantResourceOperations.update(apiVersion: string, provider: "Microsoft.ThisWillBeReplaced", properties: Azure.ResourceManager.Foundations.ResourceUpdateModel<Resource, Properties>): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `TenantResourceOperations.delete` {#Azure.ResourceManager.TenantResourceOperations.delete}

```typespec
op Azure.ResourceManager.TenantResourceOperations.delete(apiVersion: string, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmDeletedResponse | Azure.ResourceManager.ArmDeleteAcceptedLroResponse<Azure.ResourceManager.{ location: string, retryAfter: int32 }> | Azure.ResourceManager.ArmDeletedNoContentResponse | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `TenantResourceOperations.listByParent` {#Azure.ResourceManager.TenantResourceOperations.listByParent}

```typespec
op Azure.ResourceManager.TenantResourceOperations.listByParent(apiVersion: string, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `TrackedResourceOperations` {#Azure.ResourceManager.TrackedResourceOperations}

A composite interface for resources that include `ResourceInstanceOperations<Resource, Properties>`
and `ResourceCollectionOperations<Resource>`. It includes: `GET`, `PUT`, `PATCH`, `DELETE`, ListByParent,
ListBySubscription operations. The actual route depends on the resource model.
This is the most common API pattern for Tracked Resources to use.

```typespec
interface Azure.ResourceManager.TrackedResourceOperations<Resource, Properties, BaseParameters>
```

#### Template Parameters

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| Resource       | the ArmResource that provides these operations   |
| Properties     | RP-specific property bag for the resource        |
| BaseParameters | The http parameters that are part of the request |

#### `TrackedResourceOperations.get` {#Azure.ResourceManager.TrackedResourceOperations.get}

```typespec
op Azure.ResourceManager.TrackedResourceOperations.get(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `TrackedResourceOperations.createOrUpdate` {#Azure.ResourceManager.TrackedResourceOperations.createOrUpdate}

```typespec
op Azure.ResourceManager.TrackedResourceOperations.createOrUpdate(provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Azure.ResourceManager.ArmResourceUpdatedResponse<Resource> | Azure.ResourceManager.ArmResourceCreatedResponse<Resource, LroHeaders> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `TrackedResourceOperations.update` {#Azure.ResourceManager.TrackedResourceOperations.update}

```typespec
op Azure.ResourceManager.TrackedResourceOperations.update(provider: "Microsoft.ThisWillBeReplaced", properties: Azure.ResourceManager.Foundations.ResourceUpdateModel<Resource, Properties>): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `TrackedResourceOperations.delete` {#Azure.ResourceManager.TrackedResourceOperations.delete}

```typespec
op Azure.ResourceManager.TrackedResourceOperations.delete(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmDeletedResponse | Azure.ResourceManager.ArmDeleteAcceptedLroResponse<Azure.ResourceManager.{ location: string, retryAfter: int32 }> | Azure.ResourceManager.ArmDeletedNoContentResponse | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `TrackedResourceOperations.listByParent` {#Azure.ResourceManager.TrackedResourceOperations.listByParent}

```typespec
op Azure.ResourceManager.TrackedResourceOperations.listByParent(provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### `TrackedResourceOperations.listBySubscription` {#Azure.ResourceManager.TrackedResourceOperations.listBySubscription}

```typespec
op Azure.ResourceManager.TrackedResourceOperations.listBySubscription(apiVersion: string, subscriptionId: Azure.Core.uuid, provider: "Microsoft.ThisWillBeReplaced"): Azure.ResourceManager.ArmResponse<Azure.ResourceManager.ResourceListResult<Resource>> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

### `ArmCustomPatchAsync` {#Azure.ResourceManager.ArmCustomPatchAsync}

A long-running resource update using a custom PATCH payload (Asynchronous)

```typespec
op Azure.ResourceManager.ArmCustomPatchAsync(provider: "Microsoft.ThisWillBeReplaced", properties: PatchModel): Response | Error
```

#### Template Parameters

| Name           | Description                                                                   |
| -------------- | ----------------------------------------------------------------------------- |
| Resource       | the resource being patched                                                    |
| PatchModel     | The input model for the PATCH request                                         |
| BaseParameters | Optional. Allows overriding the operation parameters                          |
| LroHeaders     | Optional. Allows overriding the lro headers returned in the Accepted response |
| Parameters     | Optional. Additional parameters after the path parameters                     |
| Response       | Optional. The success response for the patch operation                        |
| Error          | Optional. The error response, if non-standard.                                |

### `ArmCustomPatchSync` {#Azure.ResourceManager.ArmCustomPatchSync}

A resource update using a custom PATCH payload (synchronous)

```typespec
op Azure.ResourceManager.ArmCustomPatchSync(provider: "Microsoft.ThisWillBeReplaced", properties: PatchModel): Response | Error
```

#### Template Parameters

| Name           | Description                                               |
| -------------- | --------------------------------------------------------- |
| Resource       | the resource being patched                                |
| PatchModel     | The input model for the PATCH request                     |
| BaseParameters | Optional. Allows overriding the operation parameters      |
| Parameters     | Optional. Additional parameters after the path parameters |
| Response       | Optional. The success response for the patch operation    |
| Error          | Optional. The error response, if non-standard.            |

### `ArmListBySubscription` {#Azure.ResourceManager.ArmListBySubscription}

A resource list operation, at the subscription scope

```typespec
op Azure.ResourceManager.ArmListBySubscription(apiVersion: string, subscriptionId: Azure.Core.uuid, provider: "Microsoft.ThisWillBeReplaced"): Response | Error
```

#### Template Parameters

| Name       | Description                                               |
| ---------- | --------------------------------------------------------- |
| Resource   | the resource being patched                                |
| Parameters | Optional. Additional parameters after the path parameters |
| Response   | Optional. The success response for the list operation     |
| Error      | Optional. The error response, if non-standard.            |

### `ArmProviderActionAsync` {#Azure.ResourceManager.ArmProviderActionAsync}

```typespec
op Azure.ResourceManager.ArmProviderActionAsync(apiVersion: string, subscriptionId: Azure.Core.uuid, location: string, resourceGroupName: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced", body: Request): Azure.ResourceManager.ArmAcceptedLroResponse<Description, LroHeaders> | Response | Error
```

#### Template Parameters

| Name                | Description                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Request             | The request model for the action                                                                      |
| Response            | The response type for the action                                                                      |
| Scope               | The scope of the action (SubscriptionActionScope, TenantActionScope, or ExtensionResourceActionScope) |
| Parameters          | Optional. Additional parameters after the path parameters (e.g. Location)                             |
| LroHeaders          | Optional. Allows overriding the lro headers returned in the Accepted response                         |
| Error               | Optional. The error response, if non-standard.                                                        |
| OptionalRequestBody | Optional. Indicates whether the request body is optional.                                             |

### `ArmProviderActionSync` {#Azure.ResourceManager.ArmProviderActionSync}

```typespec
op Azure.ResourceManager.ArmProviderActionSync(apiVersion: string, subscriptionId: Azure.Core.uuid, location: string, resourceGroupName: string, resourceUri: string, provider: "Microsoft.ThisWillBeReplaced", body: Request): Response | Error
```

#### Template Parameters

| Name                | Description                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Request             | The request model for the action                                                                      |
| Response            | The response type for the action                                                                      |
| Scope               | The scope of the action (SubscriptionActionScope, TenantActionScope, or ExtensionResourceActionScope) |
| Parameters          | Optional. Additional parameters after the path parameters (e.g. Location)                             |
| Error               | Optional. The error response, if non-standard.                                                        |
| OptionalRequestBody | Optional. Indicates whether the request body is optional.                                             |

### `ArmResourceActionAsync` {#Azure.ResourceManager.ArmResourceActionAsync}

```typespec
op Azure.ResourceManager.ArmResourceActionAsync(provider: "Microsoft.ThisWillBeReplaced", body: Request): Azure.ResourceManager.ArmAcceptedLroResponse<Description, LroHeaders> | Response | Error
```

#### Template Parameters

| Name                | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| Resource            | The resource being acted upon                                             |
| Request             | The request model for the action                                          |
| Response            | The response model for the action                                         |
| BaseParameters      | Optional. Allows overriding the parameters for the operation              |
| LroHeaders          | Optional. Allows overriding the headers returned in the Accepted response |
| Parameters          | Optional. Additional parameters after the path parameters                 |
| Error               | Optional. The error response, if non-standard.                            |
| OptionalRequestBody | Optional. Indicates whether the body parameter is optional.               |

### `ArmResourceActionAsyncBase` {#Azure.ResourceManager.ArmResourceActionAsyncBase}

A long-running resource action.

```typespec
op Azure.ResourceManager.ArmResourceActionAsyncBase(provider: "Microsoft.ThisWillBeReplaced", body: Request): Response | Error
```

#### Template Parameters

| Name                | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| Resource            | The resource being acted upon                                |
| Request             | The request model for the action                             |
| Response            | The response type for the action                             |
| BaseParameters      | Optional. Allows overriding the parameters for the operation |
| Parameters          | Optional. Additional parameters after the path parameters    |
| Error               | Optional. The error response, if non-standard.               |
| OptionalRequestBody | Optional. Indicates whether the request body is optional.    |

### `ArmResourceActionNoContentAsync` {#Azure.ResourceManager.ArmResourceActionNoContentAsync}

```typespec
op Azure.ResourceManager.ArmResourceActionNoContentAsync(provider: "Microsoft.ThisWillBeReplaced", body: Request): Azure.ResourceManager.ArmAcceptedLroResponse<Description, LroHeaders> | Azure.ResourceManager.ArmNoContentResponse<"Action completed successfully."> | Error
```

#### Template Parameters

| Name                | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| Resource            | The resource being acted upon                                             |
| Request             | The request model for the action                                          |
| BaseParameters      | Optional. Allows overriding the parameters for the operation              |
| LroHeaders          | Optional. Allows overriding the headers returned in the Accepted response |
| Parameters          | Optional. Additional parameters after the path parameters                 |
| Error               | Optional. The error response, if non-standard.                            |
| OptionalRequestBody | Optional. Indicates whether the body parameter is optional.               |

### `ArmResourceActionNoContentSync` {#Azure.ResourceManager.ArmResourceActionNoContentSync}

A synchronous resource action that returns no content.

```typespec
op Azure.ResourceManager.ArmResourceActionNoContentSync(provider: "Microsoft.ThisWillBeReplaced", body: Request): Azure.ResourceManager.ArmNoContentResponse<"Action completed successfully."> | Error
```

#### Template Parameters

| Name                | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| Resource            | The resource being acted upon                                |
| Request             | The request model for the action                             |
| BaseParameters      | Optional. Allows overriding the parameters for the operation |
| Parameters          | Optional. Additional parameters after the path parameters    |
| Error               | Optional. The error response, if non-standard.               |
| OptionalRequestBody | Optional. Indicates whether the request body is optional.    |

### `ArmResourceActionNoResponseContentAsync` {#Azure.ResourceManager.ArmResourceActionNoResponseContentAsync}

```typespec
op Azure.ResourceManager.ArmResourceActionNoResponseContentAsync(provider: "Microsoft.ThisWillBeReplaced", body: Request): Azure.ResourceManager.ArmAcceptedLroResponse<Description, LroHeaders> | Error
```

#### Template Parameters

| Name                | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| Resource            | The resource being acted upon                                             |
| Request             | The request model for the action                                          |
| BaseParameters      | Optional. Allows overriding the parameters for the operation              |
| LroHeaders          | Optional. Allows overriding the headers returned in the Accepted response |
| Parameters          | Optional. Additional parameters after the path parameters                 |
| Error               | Optional. The error response, if non-standard.                            |
| OptionalRequestBody | Optional. Indicates whether the body parameter is optional.               |

### `ArmResourceActionSync` {#Azure.ResourceManager.ArmResourceActionSync}

A synchronous resource action.

```typespec
op Azure.ResourceManager.ArmResourceActionSync(provider: "Microsoft.ThisWillBeReplaced", body: Request): Response | Error
```

#### Template Parameters

| Name                | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| Resource            | The resource being acted upon                                |
| Request             | The request model for the action                             |
| Response            | The response model for the action                            |
| BaseParameters      | Optional. Allows overriding the parameters for the operation |
| Parameters          | Optional. Additional parameters after the path parameters    |
| Error               | Optional. The error response, if non-standard.               |
| OptionalRequestBody | Optional. Indicates whether the body parameter is optional.  |

### `ArmResourceCheckExistence` {#Azure.ResourceManager.ArmResourceCheckExistence}

Check a resource's existence via HEAD operation

```typespec
op Azure.ResourceManager.ArmResourceCheckExistence(provider: "Microsoft.ThisWillBeReplaced"): Response | Error
```

#### Template Parameters

| Name           | Description                                               |
| -------------- | --------------------------------------------------------- |
| Resource       | the resource being checked                                |
| BaseParameters | Optional. Allows overriding the operation parameters      |
| Parameters     | Optional. Additional parameters after the path parameters |
| Response       | Optional. The success response for the read operation     |
| Error          | Optional. The error response, if non-standard.            |

### `ArmResourceCreateOrReplaceAsync` {#Azure.ResourceManager.ArmResourceCreateOrReplaceAsync}

```typespec
op Azure.ResourceManager.ArmResourceCreateOrReplaceAsync(provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Response | Error
```

#### Template Parameters

| Name           | Description                                                             |
| -------------- | ----------------------------------------------------------------------- |
| Resource       | the resource being created or replaced                                  |
| BaseParameters | Optional. Allows overriding the operation parameters                    |
| LroHeaders     | Optional. Allows overriding the lro headers returned on resource create |
| Parameters     | Optional. Additional parameters after the path parameters               |
| Response       | Optional. The success response for the createOrReplace operation        |
| Error          | Optional. The error response, if non-standard.                          |

### `ArmResourceCreateOrReplaceSync` {#Azure.ResourceManager.ArmResourceCreateOrReplaceSync}

Synchronous PUT operation for Azure Resource Manager resources

```typespec
op Azure.ResourceManager.ArmResourceCreateOrReplaceSync(provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Response | Error
```

#### Template Parameters

| Name           | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| Resource       | the resource being created or replaced                          |
| BaseParameters | Optional. Allows overriding the operation parameters            |
| Parameters     | Optional. Additional parameters after the path parameters       |
| Response       | Optional. The success response for the createOrUpdate operation |
| Error          | Optional. The error response, if non-standard.                  |

### `ArmResourceCreateOrUpdateAsync` {#Azure.ResourceManager.ArmResourceCreateOrUpdateAsync}

A long-running resource CreateOrUpdate (PUT)

```typespec
op Azure.ResourceManager.ArmResourceCreateOrUpdateAsync(provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Response | Error
```

#### Template Parameters

| Name           | Description                                                             |
| -------------- | ----------------------------------------------------------------------- |
| Resource       | the resource being created or updated                                   |
| BaseParameters | Optional. Allows overriding the operation parameters                    |
| LroHeaders     | Optional. Allows overriding the lro headers returned on resource create |
| Parameters     | Optional. Additional parameters after the path parameters               |
| Response       | Optional. The success response for the createOrUpdate operation         |
| Error          | Optional. The error response, if non-standard.                          |

### `ArmResourceCreateOrUpdateSync` {#Azure.ResourceManager.ArmResourceCreateOrUpdateSync}

:::caution
**Deprecated**: Please use ArmResourceCreateOrReplaceSync instead
:::

DEPRECATED: Please use ArmResourceCreateOrReplaceSync instead

```typespec
op Azure.ResourceManager.ArmResourceCreateOrUpdateSync(provider: "Microsoft.ThisWillBeReplaced", resource: Resource): Response | Error
```

#### Template Parameters

| Name           | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| Resource       | the resource being created or updated                           |
| BaseParameters | Optional. Allows overriding the operation parameters            |
| Parameters     | Optional. Additional parameters after the path parameters       |
| Response       | Optional. The success response for the createOrUpdate operation |
| Error          | Optional. The error response, if non-standard.                  |

### `ArmResourceDeleteAsync` {#Azure.ResourceManager.ArmResourceDeleteAsync}

:::caution
**Deprecated**: Use 'ArmResourceDeleteWithoutOkAsync' instead
:::

```typespec
op Azure.ResourceManager.ArmResourceDeleteAsync(provider: "Microsoft.ThisWillBeReplaced"): Response | Error
```

#### Template Parameters

| Name           | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| Resource       | The resource being deleted                                       |
| BaseParameters | Optional. Allows overriding the parameters for the operation     |
| LroHeaders     | Optional. Allows overriding the headers in the Accepted response |
| Parameters     | Optional. Additional parameters after the path parameters        |
| Response       | Optional. The success response(s) for the delete operation       |
| Error          | Optional. The error response, if non-standard.                   |

### `ArmResourceDeleteAsyncBase` {#Azure.ResourceManager.ArmResourceDeleteAsyncBase}

```typespec
op Azure.ResourceManager.ArmResourceDeleteAsyncBase(provider: "Microsoft.ThisWillBeReplaced"): Response | Error
```

#### Template Parameters

| Name           | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| Resource       | The resource being deleted                                   |
| Response       | The response type for the operation                          |
| BaseParameters | Optional. Allows overriding the parameters for the operation |
| Parameters     | Optional. Additional parameters after the path parameters    |
| Error          | Optional. The error response, if non-standard.               |

### `ArmResourceDeleteSync` {#Azure.ResourceManager.ArmResourceDeleteSync}

Delete a resource synchronously

```typespec
op Azure.ResourceManager.ArmResourceDeleteSync(provider: "Microsoft.ThisWillBeReplaced"): Response | Error
```

#### Template Parameters

| Name           | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| Resource       | The resource being deleted                                   |
| BaseParameters | Optional. Allows overriding the parameters for the operation |
| Parameters     | Optional. Additional parameters after the path parameters    |
| Response       | Optional. The success response(s) for the delete operation   |
| Error          | Optional. The error response, if non-standard.               |

### `ArmResourceDeleteWithoutOkAsync` {#Azure.ResourceManager.ArmResourceDeleteWithoutOkAsync}

```typespec
op Azure.ResourceManager.ArmResourceDeleteWithoutOkAsync(provider: "Microsoft.ThisWillBeReplaced"): Response | Error
```

#### Template Parameters

| Name           | Description                                                               |
| -------------- | ------------------------------------------------------------------------- |
| Resource       | The resource being deleted                                                |
| BaseParameters | Optional. Allows overriding the parameters for the operation              |
| LroHeaders     | Optional. Allows overriding the headers returned in the Accepted response |
| Parameters     | Optional. Additional parameters after the path parameters                 |
| Response       | Optional. The success response(s) for the delete operation                |
| Error          | Optional. The error response, if non-standard.                            |

### `ArmResourceListAtScope` {#Azure.ResourceManager.ArmResourceListAtScope}

A resource list operation, with scope determined by BaseParameters

```typespec
op Azure.ResourceManager.ArmResourceListAtScope(provider: "Microsoft.ThisWillBeReplaced"): Response | Error
```

#### Template Parameters

| Name           | Description                                               |
| -------------- | --------------------------------------------------------- |
| Resource       | the resource being patched                                |
| BaseParameters | Optional. Allows overriding the operation parameters      |
| Parameters     | Optional. Additional parameters after the path parameters |
| Response       | Optional. The success response for the list operation     |
| Error          | Optional. The error response, if non-standard.            |

### `ArmResourceListByParent` {#Azure.ResourceManager.ArmResourceListByParent}

A resource list operation, at the scope of the resource's parent

```typespec
op Azure.ResourceManager.ArmResourceListByParent(provider: "Microsoft.ThisWillBeReplaced"): Response | Error
```

#### Template Parameters

| Name               | Description                                               |
| ------------------ | --------------------------------------------------------- |
| Resource           | the resource being patched                                |
| BaseParameters     | Optional. Allows overriding the operation parameters      |
| ParentName         | Optional. The name of the parent resource                 |
| ParentFriendlyName | Optional. The friendly name of the parent resource        |
| Parameters         | Optional. Additional parameters after the path parameters |
| Response           | Optional. The success response for the list operation     |
| Error              | Optional. The error response, if non-standard.            |

### `ArmResourcePatchAsync` {#Azure.ResourceManager.ArmResourcePatchAsync}

```typespec
op Azure.ResourceManager.ArmResourcePatchAsync(provider: "Microsoft.ThisWillBeReplaced", properties: Resource): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.ArmAcceptedLroResponse<Description, LroHeaders> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### Template Parameters

| Name           | Description                                                                   |
| -------------- | ----------------------------------------------------------------------------- |
| Resource       | the resource being patched                                                    |
| Properties     | The model type of the resource properties                                     |
| BaseParameters | Optional. Allows overriding the operation parameters                          |
| LroHeaders     | Optional. Allows overriding the lro headers returned in the Accepted response |
| Parameters     | Optional. Additional parameters after the path parameters                     |

### `ArmResourcePatchSync` {#Azure.ResourceManager.ArmResourcePatchSync}

```typespec
op Azure.ResourceManager.ArmResourcePatchSync(provider: "Microsoft.ThisWillBeReplaced", properties: Resource): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### Template Parameters

| Name           | Description                                               |
| -------------- | --------------------------------------------------------- |
| Resource       | the resource being patched                                |
| Properties     | The model type of the resource properties                 |
| BaseParameters | Optional. Allows overriding the operation parameters      |
| Parameters     | Optional. Additional parameters after the path parameters |

### `ArmResourceRead` {#Azure.ResourceManager.ArmResourceRead}

A resource GET operation

```typespec
op Azure.ResourceManager.ArmResourceRead(provider: "Microsoft.ThisWillBeReplaced"): Response | Error
```

#### Template Parameters

| Name           | Description                                               |
| -------------- | --------------------------------------------------------- |
| Resource       | the resource being read                                   |
| BaseParameters | Optional. Allows overriding the operation parameters      |
| Parameters     | Optional. Additional parameters after the path parameters |
| Response       | Optional. The success response for the read operation     |
| Error          | Optional. The error response, if non-standard.            |

### `ArmTagsPatchAsync` {#Azure.ResourceManager.ArmTagsPatchAsync}

```typespec
op Azure.ResourceManager.ArmTagsPatchAsync(provider: "Microsoft.ThisWillBeReplaced", properties: Azure.ResourceManager.Foundations.TagsUpdateModel<Resource>): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.ArmAcceptedLroResponse<Description, LroHeaders> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### Template Parameters

| Name           | Description                                                                      |
| -------------- | -------------------------------------------------------------------------------- |
| Resource       | the resource being patched                                                       |
| Properties     | Optional. Exists for parallelism with ArmResourcePatch.                          |
| BaseParameters | Optional. Allows overriding the operation parameters                             |
| LroHeaders     | Optional. Allows overriding the lro headers that appear in the Accepted response |
| Parameters     | Optional. Additional parameters after the path parameters                        |

### `ArmTagsPatchSync` {#Azure.ResourceManager.ArmTagsPatchSync}

```typespec
op Azure.ResourceManager.ArmTagsPatchSync(provider: "Microsoft.ThisWillBeReplaced", properties: Azure.ResourceManager.Foundations.TagsUpdateModel<Resource>): Azure.ResourceManager.ArmResponse<ResponseBody> | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### Template Parameters

| Name           | Description                                               |
| -------------- | --------------------------------------------------------- |
| Resource       | the resource being patched                                |
| BaseParameters | Optional. Allows overriding the operation parameters      |
| Parameters     | Optional. Additional parameters after the path parameters |

### `checkGlobalNameAvailability` {#Azure.ResourceManager.checkGlobalNameAvailability}

```typespec
op Azure.ResourceManager.checkGlobalNameAvailability(apiVersion: string, subscriptionId: Azure.Core.uuid, provider: "Microsoft.ThisWillBeReplaced", body: Request): Response | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### Template Parameters

| Name             | Description                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Request          | the availability request, defaults to the standard request, containing name and resource type |
| Response         | the availability response, default to the standard response                                   |
| AdditionalParams | A model specifying additional non-path parameters to the availability request                 |

### `checkLocalNameAvailability` {#Azure.ResourceManager.checkLocalNameAvailability}

```typespec
op Azure.ResourceManager.checkLocalNameAvailability(apiVersion: string, subscriptionId: Azure.Core.uuid, provider: "Microsoft.ThisWillBeReplaced", location: Azure.Core.azureLocation, body: Request): Response | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### Template Parameters

| Name             | Description                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Request          | the availability request, defaults to the standard request, containing name and resource type |
| Response         | the availability response, default to the standard response                                   |
| AdditionalParams | A model specifying additional non-path parameters to the availability request                 |

## Azure.ResourceManager.Foundations

### `ArmCreateOperation` {#Azure.ResourceManager.Foundations.ArmCreateOperation}

```typespec
op Azure.ResourceManager.Foundations.ArmCreateOperation(resource: BodyParameter): Response | ErrorResponse
```

#### Template Parameters

| Name           | Description                                     |
| -------------- | ----------------------------------------------- |
| HttpParameters | The parameter object for the operation.         |
| BodyParameter  | The body parameter                              |
| Response       | The response or union of responses for success. |
| ErrorResponse  | The error response.                             |

### `ArmReadOperation` {#Azure.ResourceManager.Foundations.ArmReadOperation}

```typespec
op Azure.ResourceManager.Foundations.ArmReadOperation(): Response | ErrorResponse
```

#### Template Parameters

| Name          | Description                                     |
| ------------- | ----------------------------------------------- |
| Parameters    | The parameter object for the operation.         |
| Response      | The response or union of responses for success. |
| ErrorResponse | The error response.                             |

### `ArmUpdateOperation` {#Azure.ResourceManager.Foundations.ArmUpdateOperation}

```typespec
op Azure.ResourceManager.Foundations.ArmUpdateOperation(properties: BodyParameter): Response | ErrorResponse
```

#### Template Parameters

| Name           | Description                                     |
| -------------- | ----------------------------------------------- |
| HttpParameters | The parameter object for the operation.         |
| BodyParameter  | The body parameter                              |
| Response       | The response or union of responses for success. |
| ErrorResponse  | The error response.                             |

### `checkNameAvailability` {#Azure.ResourceManager.Foundations.checkNameAvailability}

Adds check name availability operation, normally used if
a resource name must be globally unique (for example, if the resource
exposes an endpoint that uses the resource name in the url)

```typespec
op Azure.ResourceManager.Foundations.checkNameAvailability(apiVersion: string, body: Request): Response | Azure.ResourceManager.CommonTypes.ErrorResponse
```

#### Template Parameters

| Name             | Description                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| ScopeParameters  | A parameter model with properties representing the scope of the resource |
| Request          | The operation request body                                               |
| Response         | The operation response                                                   |
| AdditionalParams | A parameter model with properties representing non-path parameters       |

## Azure.ResourceManager.Legacy

### `LegacyOperations` {#Azure.ResourceManager.Legacy.LegacyOperations}

An operation template used to build resource operations in which the same resource type
is accessible at multiple, fixed resource paths.

```typespec
interface Azure.ResourceManager.Legacy.LegacyOperations<ParentParameters, ResourceTypeParameter, ErrorType>
```

#### Template Parameters

| Name                  | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| ParentParameters      | The path parameters for the resource parent                                      |
| ResourceTypeParameter | The path parameter for the resource name                                         |
| ErrorType             | Optional. The type of error models used in operations created form this template |

#### `LegacyOperations.CreateOrUpdateAsync` {#Azure.ResourceManager.Legacy.LegacyOperations.CreateOrUpdateAsync}

A long-running resource CreateOrUpdate (PUT)

```typespec
op Azure.ResourceManager.Legacy.LegacyOperations.CreateOrUpdateAsync(resource: Resource): Response | ErrorType
```

##### Template Parameters

| Name                | Description                                                             |
| ------------------- | ----------------------------------------------------------------------- |
| Resource            | the resource being created or updated                                   |
| LroHeaders          | Optional. Allows overriding the lro headers returned on resource create |
| Parameters          | Optional. Additional parameters after the path parameters               |
| Response            | Optional. The success response(s) for the PUT operation                 |
| OptionalRequestBody | Optional. Indicates whether the request body is optional                |

#### `LegacyOperations.CreateOrUpdateSync` {#Azure.ResourceManager.Legacy.LegacyOperations.CreateOrUpdateSync}

A synchronous resource CreateOrUpdate (PUT)

```typespec
op Azure.ResourceManager.Legacy.LegacyOperations.CreateOrUpdateSync(resource: Resource): Response | ErrorType
```

##### Template Parameters

| Name                | Description                                               |
| ------------------- | --------------------------------------------------------- |
| Resource            | the resource being created or updated                     |
| Parameters          | Optional. Additional parameters after the path parameters |
| Response            | Optional. The success response(s) for the PUT operation   |
| OptionalRequestBody | Optional. Indicates whether the request body is optional  |

#### `LegacyOperations.CustomPatchAsync` {#Azure.ResourceManager.Legacy.LegacyOperations.CustomPatchAsync}

A long-running resource Update (PATCH)

```typespec
op Azure.ResourceManager.Legacy.LegacyOperations.CustomPatchAsync(properties: PatchModel): Response | ErrorType
```

##### Template Parameters

| Name                | Description                                                             |
| ------------------- | ----------------------------------------------------------------------- |
| Resource            | the resource being created or updated                                   |
| PatchModel          | the PATCH request model                                                 |
| LroHeaders          | Optional. Allows overriding the lro headers returned on resource create |
| Parameters          | Optional. Additional parameters after the path parameters               |
| Response            | Optional. The success response(s) for the PATCH operation               |
| OptionalRequestBody | Optional. Indicates whether the request body is optional                |

#### `LegacyOperations.CustomPatchSync` {#Azure.ResourceManager.Legacy.LegacyOperations.CustomPatchSync}

A synchronous resource Update (PATCH)

```typespec
op Azure.ResourceManager.Legacy.LegacyOperations.CustomPatchSync(properties: PatchModel): Response | ErrorType
```

##### Template Parameters

| Name                | Description                                               |
| ------------------- | --------------------------------------------------------- |
| Resource            | the resource being created or updated                     |
| PatchModel          | the PATCH request model                                   |
| Parameters          | Optional. Additional parameters after the path parameters |
| Response            | Optional. The success response(s) for the PATCH operation |
| OptionalRequestBody | Optional. Indicates whether the request body is optional  |

#### `LegacyOperations.DeleteWithoutOkAsync` {#Azure.ResourceManager.Legacy.LegacyOperations.DeleteWithoutOkAsync}

Delete a resource asynchronously

```typespec
op Azure.ResourceManager.Legacy.LegacyOperations.DeleteWithoutOkAsync(): Response | ErrorType
```

##### Template Parameters

| Name       | Description                                                |
| ---------- | ---------------------------------------------------------- |
| Resource   | The resource being deleted                                 |
| LroHeaders | The lro headers for the operation                          |
| Parameters | Optional. Additional parameters after the path parameters  |
| Response   | Optional. The success response(s) for the delete operation |

#### `LegacyOperations.DeleteSync` {#Azure.ResourceManager.Legacy.LegacyOperations.DeleteSync}

Delete a resource synchronously

```typespec
op Azure.ResourceManager.Legacy.LegacyOperations.DeleteSync(): Response | ErrorType
```

##### Template Parameters

| Name       | Description                                                |
| ---------- | ---------------------------------------------------------- |
| Resource   | The resource being deleted                                 |
| Parameters | Optional. Additional parameters after the path parameters  |
| Response   | Optional. The success response(s) for the delete operation |

#### `LegacyOperations.Read` {#Azure.ResourceManager.Legacy.LegacyOperations.Read}

```typespec
op Azure.ResourceManager.Legacy.LegacyOperations.Read(): Response | ErrorType
```

##### Template Parameters

| Name       | Description                                               |
| ---------- | --------------------------------------------------------- |
| Resource   | The resource being read                                   |
| Parameters | Optional. Additional parameters after the path parameters |
| Response   | Optional. The success response for a get operation.       |

#### `LegacyOperations.List` {#Azure.ResourceManager.Legacy.LegacyOperations.List}

List a resource

```typespec
op Azure.ResourceManager.Legacy.LegacyOperations.List(): Response | ErrorType
```

##### Template Parameters

| Name       | Description                                               |
| ---------- | --------------------------------------------------------- |
| Resource   | The resource being listed                                 |
| Parameters | Optional. Additional parameters after the path parameters |
| Response   | Optional. The response returned by the list               |

#### `LegacyOperations.ActionSync` {#Azure.ResourceManager.Legacy.LegacyOperations.ActionSync}

A synchronous resource action.

```typespec
op Azure.ResourceManager.Legacy.LegacyOperations.ActionSync(body: Request): Response | ErrorType
```

##### Template Parameters

| Name                | Description                                               |
| ------------------- | --------------------------------------------------------- |
| Resource            | The resource being acted upon                             |
| Request             | The request model for the action                          |
| Response            | The response model for the action                         |
| Parameters          | Optional. Additional parameters after the path parameters |
| OptionalRequestBody | Optional. Indicates whether the request body is optional  |

#### `LegacyOperations.ActionAsync` {#Azure.ResourceManager.Legacy.LegacyOperations.ActionAsync}

A long-running resource action.

```typespec
op Azure.ResourceManager.Legacy.LegacyOperations.ActionAsync(body: Request): Response | ErrorType
```

##### Template Parameters

| Name                | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| Resource            | The resource being acted upon                                             |
| Request             | The request model for the action                                          |
| Result              |                                                                           |
| LroHeaders          | Optional. Allows overriding the headers returned in the Accepted response |
| Parameters          | Optional. Additional parameters after the path parameters                 |
| Response            | The response model for the action                                         |
| OptionalRequestBody | Optional. Indicates whether the request body is optional                  |

### `CustomPatchAsync` {#Azure.ResourceManager.Legacy.CustomPatchAsync}

A long-running resource update using a custom PATCH payload (Asynchronous)

```typespec
op Azure.ResourceManager.Legacy.CustomPatchAsync(provider: "Microsoft.ThisWillBeReplaced", properties: PatchModel): Response | Error
```

#### Template Parameters

| Name                | Description                                                                   |
| ------------------- | ----------------------------------------------------------------------------- |
| Resource            | the resource being patched                                                    |
| PatchModel          | The input model for the PATCH request                                         |
| BaseParameters      | Optional. Allows overriding the operation parameters                          |
| LroHeaders          | Optional. Allows overriding the lro headers returned in the Accepted response |
| Parameters          | Optional. Additional parameters after the path parameters                     |
| Response            | Optional. The success response for the patch operation                        |
| Error               | Optional. The error response, if non-standard.                                |
| OptionalRequestBody | Optional. Indicates whether the request body is optional                      |

### `CustomPatchSync` {#Azure.ResourceManager.Legacy.CustomPatchSync}

A resource update using a custom PATCH payload (synchronous)

```typespec
op Azure.ResourceManager.Legacy.CustomPatchSync(provider: "Microsoft.ThisWillBeReplaced", properties: PatchModel): Response | Error
```

#### Template Parameters

| Name                | Description                                               |
| ------------------- | --------------------------------------------------------- |
| Resource            | the resource being patched                                |
| PatchModel          | The input model for the PATCH request                     |
| BaseParameters      | Optional. Allows overriding the operation parameters      |
| Parameters          | Optional. Additional parameters after the path parameters |
| Response            | Optional. The success response for the patch operation    |
| Error               | Optional. The error response, if non-standard.            |
| OptionalRequestBody | Optional. Indicates whether the request body is optional  |

### `UpdateOperation` {#Azure.ResourceManager.Legacy.UpdateOperation}

```typespec
op Azure.ResourceManager.Legacy.UpdateOperation(properties: BodyParameter): Response | ErrorResponse
```

#### Template Parameters

| Name                | Description                                              |
| ------------------- | -------------------------------------------------------- |
| HttpParameters      | The parameter object for the operation.                  |
| BodyParameter       | The body parameter                                       |
| Response            | The response or union of responses for success.          |
| ErrorResponse       | The error response.                                      |
| OptionalRequestBody | Optional. Indicates whether the request body is optional |
