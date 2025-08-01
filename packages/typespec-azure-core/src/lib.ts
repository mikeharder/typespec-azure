import { createTypeSpecLibrary, paramMessage } from "@typespec/compiler";

export const $lib = createTypeSpecLibrary({
  name: "@azure-tools/typespec-azure-core",
  diagnostics: {
    "lro-status-union-non-string": {
      severity: "error",
      messages: {
        default: paramMessage`Union contains non-string value type ${"type"}.`,
      },
    },
    "lro-status-property-invalid-type": {
      severity: "error",
      messages: {
        default: "Property type must be a union of strings or an enum.",
      },
    },
    "lro-status-missing": {
      severity: "error",
      messages: {
        default: paramMessage`Terminal long-running operation states are missing: ${"states"}.`,
      },
    },
    "lro-status-monitor-invalid-result-property": {
      severity: "warning",
      messages: {
        default: paramMessage`StatusMonitor has more than one ${"resultType"} property marked with '${"decorator"}'.  Ensure that only one property in the model is marked with this decorator.`,
      },
    },
    "invalid-polling-operation-parameter": {
      severity: "error",
      messages: {
        default: paramMessage`The @pollingOperationParameter '${"name"}' does not reference a valid parameter in the polling operation.`,
      },
    },
    "invalid-final-state": {
      severity: "warning",
      messages: {
        badValue: paramMessage`Specified final state value '${"finalStateValue"}' is not valid. It must be one of ("operation-location", "original-uri", "location", "azure-async-operation")`,
        notPut: "The final state value 'original-uri' can only be used in http PUT operations",
        noHeader: paramMessage`There was no header corresponding to the desired final-state-via value '${"finalStateValue"}'.`,
      },
    },
    "bad-record-type": {
      severity: "warning",
      messages: {
        extendUnknown: paramMessage`${"name"} should not use '${"keyword"} Record<${"typeName"}>'. Use '${"keyword"} Record<string>' instead.`,
        recordWithProperties: paramMessage`${"name"} that uses '${"keyword"} Record<${"typeName"}>' should not have properties.`,
      },
    },
    "request-parameter-invalid": {
      severity: "error",
      messages: {
        default: paramMessage`Request parameter '${"name"}' not found on request body model.`,
      },
    },
    "response-property-invalid": {
      severity: "error",
      messages: {
        default: paramMessage`Response property '${"name"}' not found on success response model.`,
      },
    },
    "operation-link-parameter-invalid": {
      severity: "error",
      messages: {
        default: "Parameters must be of template type RequestParameter<T> or ResponseProperty<T>.",
      },
    },
    "operation-link-parameter-invalid-target": {
      severity: "error",
      messages: {
        default: paramMessage`Request parameter '${"name"}' not found in linked operation.`,
      },
    },
    "invalid-resource-type": {
      severity: "error",
      messages: {
        missingKey: paramMessage`Model type '${"name"}' is not a valid resource type.  It must contain a property decorated with '@key'.`,
        missingSegment: paramMessage`Model type '${"name"}' is not a valid resource type.  It must be decorated with the '@resource' decorator.`,
      },
    },
    "polling-operation-return-model": {
      severity: "error",
      messages: {
        default:
          "An operation annotated with @pollingOperation must return a model or union of model.",
      },
    },
    "polling-operation-no-status-monitor": {
      severity: "warning",
      messages: {
        default:
          "The operation linked in  @pollingOperation must return a valid status monitor.  The status monitor model must contain a 'status' property, or a property decorated with  '@lroStatus'.  The status field must be of Enum or Union type and contain terminal status values for success and failure.",
      },
    },
    "polling-operation-no-lro-success": {
      severity: "warning",
      messages: {
        default:
          "The status monitor returned from the polling operation must have a status property, with a known status value the indicates successful completion. This known value may be named 'Succeeded' or marked with the '@lroSucceeded' decorator.",
      },
    },
    "polling-operation-no-lro-failure": {
      severity: "warning",
      messages: {
        default:
          "The status monitor returned from the polling operation must have a status property, with a known status value the indicates failure. This known value may be named 'Failed' or marked with the '@lroFailed' decorator.",
      },
    },
    "polling-operation-no-ref-or-link": {
      severity: "warning",
      messages: {
        default:
          "An operation decorated with '@pollingOperation' must either return a response with an 'Operation-Location' header that will contain a runtime link to the polling operation, or specify parameters and return type properties to map into the polling operation parameters.  A map into polling operation parameters can be created using the '@pollingOperationParameter' decorator",
      },
    },
    "invalid-final-operation": {
      severity: "warning",
      messages: {
        default:
          "The operation linked in the '@finalOperation' decorator must have a 200 response that includes a model.",
      },
    },
    "invalid-trait-property-count": {
      severity: "error",
      messages: {
        default: paramMessage`Trait type '${"modelName"}' is not a valid trait type.  It must contain exactly one property that maps to a model type.`,
      },
    },
    "invalid-trait-property-type": {
      severity: "error",
      messages: {
        default: paramMessage`Trait type '${"modelName"}' has an invalid envelope property type.  The property '${"propertyName"}' must be a model type.`,
      },
    },
    "invalid-trait-context": {
      severity: "error",
      messages: {
        default:
          "The trait context can only be an enum member, union of enum members, or `unknown`.",
      },
    },
    "trait-property-without-location": {
      severity: "error",
      messages: {
        default: paramMessage`Trait type '${"modelName"}' contains property '${"propertyName"}' which does not have a @traitLocation decorator.`,
      },
    },
    "expected-trait-missing": {
      severity: "error",
      messages: {
        default: paramMessage`Expected trait '${"trait"}' is missing. ${"message"}`,
      },
    },
    "client-request-id-trait-missing": {
      severity: "warning",
      messages: {
        default: paramMessage`The ClientRequestId trait is required for the ResourceOperations interface.  Include either SupportsClientRequestId or NoClientRequestId in the traits model for your interface declaration.`,
      },
    },
    "repeatable-requests-trait-missing": {
      severity: "warning",
      messages: {
        default: paramMessage`The RepeatableRequests trait is required for the ResourceOperations interface.  Include either SupportsRepeatableRequests or NoRepeatableRequests in the traits model for your interface declaration.`,
      },
    },
    "conditional-requests-trait-missing": {
      severity: "warning",
      messages: {
        default: paramMessage`The ConditionalRequests trait is required for the ResourceOperations interface.  Include either SupportsConditionalRequests or NoConditionalRequests in the traits model for your interface declaration.`,
      },
    },
    "expected-trait-diagnostic-missing": {
      severity: "error",
      messages: {
        default: `Expected trait entries must have a "diagnostic" field with a valid diagnostic code for the missing trait.`,
      },
    },
    "invalid-parameter": {
      severity: "error",
      messages: {
        default: paramMessage`Expected property '${"propertyName"}' to be a ${"kind"} parameter.`,
      },
    },
    "expected-success-response": {
      severity: "error",
      messages: {
        default: "The operation must have a success response",
      },
    },
    "lro-polling-data-missing-from-operation-response": {
      severity: "error",
      messages: {
        default: "At least one operation response must contain a field marked with `@lroStatus`",
      },
    },
    "no-object": {
      severity: "warning",
      messages: {
        default:
          "Don't use 'object'.\n - If you want an object with any properties, use `Record<unknown>`\n - If you meant anything, use `unknown`.",
      },
    },
    "verb-conflict": {
      severity: "warning",
      messages: {
        default: paramMessage`Operation template '${"templateName"}' requires HTTP verb '${"requiredVerb"}' but found '${"verb"}'.`,
      },
    },
    "rpc-operation-needs-route": {
      severity: "warning",
      messages: {
        default: "The operation needs a @route",
      },
    },
    "union-enums-multiple-kind": {
      severity: "warning",
      messages: {
        default: paramMessage`Couldn't resolve the kind of the union as it has multiple types: ${"kinds"}`,
      },
    },
    "union-enums-invalid-kind": {
      severity: "warning",
      messages: {
        default: paramMessage`Kind ${"kind"} prevents this union from being resolved as an enum.`,
      },
    },
    "union-enums-circular": {
      severity: "warning",
      messages: {
        default: `Union is referencing itself and cannot be resolved as an enum.`,
      },
    },
    "preview-version-invalid-enum-member": {
      severity: "error",
      messages: {
        default: `@previewVersion can only be applied to members of a Version enum.`,
      },
    },
    "preview-version-last-member": {
      severity: "warning",
      messages: {
        default: `@previewVersion can only be applied to the last member of a Version enum. Having it on other members will cause unstable apis to show up in subsequent stable versions.`,
      },
    },
  },

  state: {
    fixed: { description: "Data for `@fixed` decorator" },
    pagedResult: { description: "Data for `@pagedResult` decorator" },
    items: { description: "Data for `@items` decorator" },
    lroStatus: { description: "Data for `@lroStatus` decorator" },
    lroSucceeded: { description: "Data for `@lroSucceeded` decorator" },
    lroCanceled: { description: "Data for `@lroCanceled` decorator" },
    lroFailed: { description: "Data for `@lroFailed` decorator" },
    lroResult: { description: "Data for `@lroResult` decorator" },
    lroErrorResult: { description: "Data for `@lroErrorResult` decorator" },
    pollingOperationParameter: { description: "Data for `@pollingOperationParameter` decorator" },
    pollingLocationInfo: { description: "Data for `@pollingLocationInfo` decorator" },
    finalLocations: { description: "Data for `@finalLocations` decorator" },
    finalLocationResults: { description: "Data for `@finalLocationResults` decorator" },
    finalStateOverride: { description: "Data for `@finalStateOverride` decorator" },
    needsRoute: { description: "Data for `@needsRoute` decorator" },
    ensureVerb: { description: "Data for `@ensureVerb` decorator" },
    embeddingVector: { description: "Data for `@embeddingVector` decorator" },
    armResourceIdentifierConfig: {
      description: "Data for `@armResourceIdentifierConfig` decorator",
    },
    operationLink: { description: "Data for `@operationLink` decorator" },
    requestParameter: { description: "Data for `@requestParameter` decorator" },
    responseParameter: { description: "Data for `@responseParameter` decorator" },
    resourceOperation: { description: "Data for `@resourceOperation` decorator" },
    traitSource: { description: "Data for `@traitSource` decorator" },
    trait: { description: "Data for `@trait` decorator" },
    traitContext: { description: "Data for `@traitContext` decorator" },
    traitLocation: { description: "Data for `@traitLocation` decorator" },
    parameterizedNextLinkConfig: {
      description: "Data for `@parameterizedNextLinkConfig` decorator",
    },
    previewVersion: {
      description: "Data for `@previewVersion` decorator",
    },
  },
  // AzureCoreStateKeys.traitLocation
});

export const { reportDiagnostic, createDiagnostic, stateKeys: AzureCoreStateKeys } = $lib;
