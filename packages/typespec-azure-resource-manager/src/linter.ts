import { defineLinter } from "@typespec/compiler";
import { armCommonTypesVersionRule } from "./rules/arm-common-types-version.js";
import { armCustomResourceNoKey } from "./rules/arm-custom-resource-no-key.js";
import { armCustomResourceUsageDiscourage } from "./rules/arm-custom-resource-usage-discourage.js";
import { armDeleteResponseCodesRule } from "./rules/arm-delete-response-codes.js";
import { armNoRecordRule } from "./rules/arm-no-record.js";
import { armPostResponseCodesRule } from "./rules/arm-post-response-codes.js";
import { armPutResponseCodesRule } from "./rules/arm-put-response-codes.js";
import { armResourceActionNoSegmentRule } from "./rules/arm-resource-action-no-segment.js";
import { armResourceDuplicatePropertiesRule } from "./rules/arm-resource-duplicate-property.js";
import { interfacesRule } from "./rules/arm-resource-interfaces.js";
import { armResourceInvalidActionVerbRule } from "./rules/arm-resource-invalid-action-verb.js";
import { armResourceEnvelopeProperties } from "./rules/arm-resource-invalid-envelope-property.js";
import { armResourceInvalidVersionFormatRule } from "./rules/arm-resource-invalid-version-format.js";
import { armResourceKeyInvalidCharsRule } from "./rules/arm-resource-key-invalid-chars.js";
import { armResourceNamePatternRule } from "./rules/arm-resource-name-pattern.js";
import { armResourceOperationsRule } from "./rules/arm-resource-operation-response.js";
import { patchOperationsRule } from "./rules/arm-resource-patch.js";
import { armResourcePathInvalidCharsRule } from "./rules/arm-resource-path-invalid-chars.js";
import { armResourceProvisioningStateRule } from "./rules/arm-resource-provisioning-state-rule.js";
import { beyondNestingRule } from "./rules/beyond-nesting-levels.js";
import { coreOperationsRule } from "./rules/core-operations.js";
import { envelopePropertiesRules } from "./rules/envelope-properties.js";
import { listBySubscriptionRule } from "./rules/list-operation.js";
import { lroLocationHeaderRule } from "./rules/lro-location-header.js";
import { missingXmsIdentifiersRule } from "./rules/missing-x-ms-identifiers.js";
import { noEmptyModel } from "./rules/no-empty-model.js";
import { deleteOperationMissingRule } from "./rules/no-resource-delete-operation.js";
import { noResponseBodyRule } from "./rules/no-response-body.js";
import { operationsInterfaceMissingRule } from "./rules/operations-interface-missing.js";
import { patchEnvelopePropertiesRules } from "./rules/patch-envelope-properties.js";
import { resourceNameRule } from "./rules/resource-name.js";
import { retryAfterRule } from "./rules/retry-after.js";
import { unsupportedTypeRule } from "./rules/unsupported-type.js";

const rules = [
  armNoRecordRule,
  armCommonTypesVersionRule,
  armDeleteResponseCodesRule,
  armPutResponseCodesRule,
  armPostResponseCodesRule,
  armResourceActionNoSegmentRule,
  armResourceDuplicatePropertiesRule,
  armResourceEnvelopeProperties,
  armResourceInvalidVersionFormatRule,
  armResourceKeyInvalidCharsRule,
  armResourceNamePatternRule,
  armResourceOperationsRule,
  armResourcePathInvalidCharsRule,
  armResourceProvisioningStateRule,
  armCustomResourceNoKey,
  armCustomResourceUsageDiscourage,
  beyondNestingRule,
  coreOperationsRule,
  deleteOperationMissingRule,
  envelopePropertiesRules,
  interfacesRule,
  armResourceInvalidActionVerbRule,
  listBySubscriptionRule,
  lroLocationHeaderRule,
  missingXmsIdentifiersRule,
  noResponseBodyRule,
  operationsInterfaceMissingRule,
  patchEnvelopePropertiesRules,
  patchOperationsRule,
  resourceNameRule,
  retryAfterRule,
  unsupportedTypeRule,
  noEmptyModel,
];

export const $linter = defineLinter({
  rules,
});
