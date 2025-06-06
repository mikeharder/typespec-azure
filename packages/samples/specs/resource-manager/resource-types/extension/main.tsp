import "@typespec/rest";
import "@typespec/versioning";
import "@azure-tools/typespec-azure-core";
import "@azure-tools/typespec-azure-resource-manager";

using Http;
using Rest;
using Versioning;
using Azure.Core;
using Azure.ResourceManager;

/** Contoso Resource Provider management API. */
@armProviderNamespace
@service(#{ title: "ContosoProviderHubClient" })
@versioned(Versions)
namespace Microsoft.ContosoProviderHub;

/** Contoso API versions */
enum Versions {
  /** 2021-10-01-preview version */
  @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
  @armCommonTypesVersion(Azure.ResourceManager.CommonTypes.Versions.v5)
  `2021-10-01-preview`,
}

/** A ContosoProviderHub resource */
model RoleAssignment is ExtensionResource<RoleAssignmentProperties> {
  ...ResourceNameParameter<RoleAssignment>;
}

/** RoleAssignment properties */
model RoleAssignmentProperties {
  /** Profile of roleAssignment */
  @encode("base64url")
  profile?: bytes;

  /** The status of the last operation. */
  @visibility(Lifecycle.Read)
  provisioningState?: ProvisioningState;
}

/** The provisioning state of a resource. */
@lroStatus
union ProvisioningState {
  ResourceProvisioningState,

  /** The resource is being provisioned */
  Provisioning: "Provisioning",

  /** The resource is updating */
  Updating: "Updating",

  /** The resource is being deleted */
  Deleting: "Deleting",

  /** The resource create request has been accepted */
  Accepted: "Accepted",

  string,
}

interface Operations extends Azure.ResourceManager.Operations {}

@armResourceOperations
interface RoleAssignments {
  get is ArmResourceRead<RoleAssignment>;
  createOrUpdate is ArmResourceCreateOrReplaceAsync<RoleAssignment>;
  update is ArmCustomPatchSync<
    RoleAssignment,
    Azure.ResourceManager.Foundations.ResourceUpdateModel<RoleAssignment, RoleAssignmentProperties>
  >;
  delete is ArmResourceDeleteSync<RoleAssignment>;
  list is ArmResourceListByParent<RoleAssignment>;

  /** A sample HEAD operation to check resource existence */
  checkExistence is ArmResourceCheckExistence<RoleAssignment>;
}
