import { createTypeSpecLibrary, JSONSchemaType, paramMessage } from "@typespec/compiler";

export interface AutorestEmitterOptions {
  /**
   * @deprecated DO NOT USE. Use built-in emitter-output-dir instead
   */
  "output-dir"?: string;

  /**
   * Name of the output file.
   * Output file will interpolate the following values:
   *  - service-name: Name of the service if multiple
   *  - version: Version of the service if multiple
   *  - azure-resource-provider-folder: Value of the azure-resource-provider-folder option
   *  - version-status: Only enabled if azure-resource-provider-folder is set. `preview` if version contains preview, stable otherwise.
   *
   * @default `{azure-resource-provider-folder}/{service-name}/{version-status}/{version}/openapi.json`
   *
   *
   * @example Single service no versioning
   *  - `openapi.yaml`
   *
   * @example Multiple services no versioning
   *  - `openapi.Org1.Service1.yaml`
   *  - `openapi.Org1.Service2.yaml`
   *
   * @example Single service with versioning
   *  - `openapi.v1.yaml`
   *  - `openapi.v2.yaml`
   *
   * @example Multiple service with versioning
   *  - `openapi.Org1.Service1.v1.yaml`
   *  - `openapi.Org1.Service1.v2.yaml`
   *  - `openapi.Org1.Service2.v1.0.yaml`
   *  - `openapi.Org1.Service2.v1.1.yaml`
   *
   * @example azureResourceProviderFolder is provided
   *  - `arm-folder/AzureService/preview/2020-01-01.yaml`
   *  - `arm-folder/AzureService/preview/2020-01-01.yaml`
   */
  "output-file"?: string;

  /**
   * Directory where the examples are located.
   * @default `{project-root}/examples`
   */
  "examples-dir"?: string;

  /**
   * @deprecated use {@link examples-dir}
   */
  "examples-directory"?: string;

  version?: string;

  "azure-resource-provider-folder"?: string;

  /**
   * Set the newline character for emitting files.
   * @default lf
   */
  "new-line"?: "crlf" | "lf";

  /**
   * Omit unreachable types.
   * By default all types declared under the service namespace will be included. With this flag on only types references in an operation will be emitted.
   */
  "omit-unreachable-types"?: boolean;

  /**
   * Decide how to deal with the Version enum when when `omit-unreachable-types` is not set.
   * @default "omit"
   */
  "version-enum-strategy"?: "omit" | "include";

  /**
   * If the generated openapi types should have the `x-typespec-name` extension set with the name of the TypeSpec type that created it.
   * This extension is meant for debugging and should not be depended on.
   * @default "never"
   */
  "include-x-typespec-name"?: "inline-only" | "never";

  /**
   * Path to the common-types.json file folder.
   * @default "${project-root}/../../common-types/resource-management"
   */
  "arm-types-dir"?: string;

  /**
   * Determines whether to transmit the 'readOnly' property to lro status schemas.
   * @default false
   */
  "use-read-only-status-schema"?: boolean;

  /**
   * Determines whether and how to emit the x-ms-long-running-operation-options
   * @default "final-state-only"
   */
  "emit-lro-options"?: "none" | "final-state-only" | "all";

  /**
   * Back-compat flag. If true, continue to emit `x-ms-client-flatten` in for some of the
   * ARM resource properties.
   */
  "arm-resource-flattening"?: boolean;
  /**
   * Determines whether and how to emit schemas for common-types
   * @default "for-visibility-changes"
   */
  "emit-common-types-schema"?: "never" | "for-visibility-changes";
}

const EmitterOptionsSchema: JSONSchemaType<AutorestEmitterOptions> = {
  type: "object",
  additionalProperties: false,
  properties: {
    "output-dir": {
      type: "string",
      nullable: true,
      deprecated: true,
      description: "Deprecated DO NOT USE. Use built-in emitter-output-dir instead",
    },
    "output-file": {
      type: "string",
      nullable: true,
      description: [
        "Name of the output file.",
        "Output file will interpolate the following values:",
        " - service-name: Name of the service if multiple",
        " - version: Version of the service if multiple",
        " - azure-resource-provider-folder: Value of the azure-resource-provider-folder option",
        " - version-status: Only enabled if azure-resource-provider-folder is set. `preview` if version contains preview, stable otherwise.",
        "",
        "Default: `{azure-resource-provider-folder}/{service-name}/{version-status}/{version}/openapi.json`",
        "",
        "",
        "Example: Single service no versioning",
        " - `openapi.yaml`",
        "",
        "Example: Multiple services no versioning",
        " - `openapi.Org1.Service1.yaml`",
        " - `openapi.Org1.Service2.yaml`",
        "",
        "Example: Single service with versioning",
        " - `openapi.v1.yaml`",
        " - `openapi.v2.yaml`",
        "",
        "Example: Multiple service with versioning",
        " - `openapi.Org1.Service1.v1.yaml`",
        " - `openapi.Org1.Service1.v2.yaml`",
        " - `openapi.Org1.Service2.v1.0.yaml`",
        " - `openapi.Org1.Service2.v1.1.yaml`",
        "",
        "Example: azureResourceProviderFolder is provided",
        " - `arm-folder/AzureService/preview/2020-01-01.yaml`",
        " - `arm-folder/AzureService/preview/2020-01-01.yaml`",
      ].join("\n"),
    },
    "examples-dir": {
      type: "string",
      nullable: true,
      description: "Directory where the examples are located. Default: `{project-root}/examples`.",
      format: "absolute-path",
    },
    "examples-directory": {
      type: "string",
      nullable: true,
      deprecated: true,
      description: "DEPRECATED. Use examples-dir instead",
    },
    version: { type: "string", nullable: true },
    "azure-resource-provider-folder": { type: "string", nullable: true },
    "arm-types-dir": {
      type: "string",
      nullable: true,
      description:
        "Path to the common-types.json file folder. Default: '${project-root}/../../common-types/resource-management'",
    },
    "new-line": {
      type: "string",
      enum: ["crlf", "lf"],
      nullable: true,
      default: "lf",
      description: "Set the newline character for emitting files.",
    },
    "omit-unreachable-types": {
      type: "boolean",
      nullable: true,
      description:
        "Omit unreachable types. By default all types declared under the service namespace will be included. With this flag on only types references in an operation will be emitted.",
    },
    "version-enum-strategy": {
      type: "string",
      nullable: true,
      description:
        "Decide how to deal with the Version enum when when `omit-unreachable-types` is not set. Default to 'omit'",
      default: "omit",
    },
    "include-x-typespec-name": {
      type: "string",
      enum: ["inline-only", "never"],
      nullable: true,
      default: "never",
      description:
        "If the generated openapi types should have the `x-typespec-name` extension set with the name of the TypeSpec type that created it.\nThis extension is meant for debugging and should not be depended on.",
    },
    "use-read-only-status-schema": {
      type: "boolean",
      nullable: true,
      default: false,
      description: "Create read-only property schema for lro status",
    },
    "emit-lro-options": {
      type: "string",
      enum: ["none", "final-state-only", "all"],
      nullable: true,
      default: "final-state-only",
      description:
        "Determine whether and how to emit x-ms-long-running-operation-options for lro resolution",
    },
    "arm-resource-flattening": {
      type: "boolean",
      nullable: true,
      default: false,
      description:
        "Back-compat flag. If true, continue to emit `x-ms-client-flatten` in for some of the ARM resource properties.",
    },
    "emit-common-types-schema": {
      type: "string",
      enum: ["never", "for-visibility-changes"],
      nullable: true,
      default: "for-visibility-changes",
      description:
        "Determine whether and how to emit schemas for common-types rather than referencing them",
    },
  },
  required: [],
};

export const $lib = createTypeSpecLibrary({
  name: "@azure-tools/typespec-autorest",
  capabilities: {
    dryRun: true,
  },
  diagnostics: {
    "duplicate-body-types": {
      severity: "error",
      messages: {
        default: "Request has multiple body types",
      },
    },
    "duplicate-header": {
      severity: "error",
      messages: {
        default: paramMessage`The header ${"header"} is defined across multiple content types`,
      },
    },
    "duplicate-example": {
      severity: "error",
      messages: {
        default: "Duplicate @example declarations on operation",
      },
    },
    "duplicate-example-file": {
      severity: "error",
      messages: {
        default: paramMessage`Example file ${"filename"} uses duplicate title '${"title"}' for operationId '${"operationId"}'`,
      },
    },
    "invalid-schema": {
      severity: "error",
      messages: {
        default: paramMessage`Couldn't get schema for type ${"type"}`,
      },
    },
    "union-null": {
      severity: "error",
      messages: {
        default: "Cannot have a union containing only null types.",
      },
    },
    "union-unsupported": {
      severity: "warning",
      messages: {
        default:
          "Unions cannot be emitted to OpenAPI v2 unless all options are literals of the same type.",
        empty:
          "Empty unions are not supported for OpenAPI v2 - enums must have at least one value.",
      },
    },
    "invalid-multi-collection-format": {
      severity: "error",
      messages: {
        default:
          "Only encode of `ArrayEncoding.pipeDelimited` and `ArrayEncoding.spaceDelimited` is supported for collection format.",
      },
    },
    "inline-cycle": {
      severity: "error",
      messages: {
        default: paramMessage`Cycle detected in '${"type"}'. Use @friendlyName decorator to assign an OpenAPI definition name and make it non-inline.`,
      },
    },
    "nonspecific-scalar": {
      severity: "warning",
      messages: {
        default: paramMessage`Scalar type '${"type"}' is not specific enough. The more specific type '${"chosenType"}' has been chosen.`,
      },
    },
    "example-loading": {
      severity: "warning",
      messages: {
        default: paramMessage`Skipped loading invalid example file: ${"filename"}. Error: ${"error"}`,
        noDirectory: paramMessage`Skipping example loading from ${"directory"} because there was an error reading the directory.`,
        noOperationId: paramMessage`Skipping example file ${"filename"} because it does not contain an operationId and/or title.`,
      },
    },
    "unsupported-http-auth-scheme": {
      severity: "warning",
      messages: {
        default: paramMessage`The specified HTTP authentication scheme is not supported by this emitter: ${"scheme"}.`,
      },
    },
    "unsupported-status-code-range": {
      severity: "error",
      messages: {
        default: paramMessage`Status code range '${"start"} to '${"end"}' is not supported. OpenAPI 2.0 can only represent range 1XX, 2XX, 3XX, 4XX and 5XX. Example: \`@minValue(400) @maxValue(499)\` for 4XX.`,
      },
    },
    "unsupported-multipart-type": {
      severity: "warning",
      messages: {
        default: paramMessage`Multipart parts can only be represented as primitive types in swagger 2.0. Information is lost for part '${"part"}'.`,
      },
    },
    "unsupported-param-type": {
      severity: "warning",
      messages: {
        default: paramMessage`Parameter can only be represented as primitive types in swagger 2.0. Information is lost for part '${"part"}'.`,
      },
    },
    "unsupported-optional-path-param": {
      severity: "warning",
      messages: {
        default: paramMessage`Path parameter '${"name"}' is optional, but swagger 2.0 does not support optional path parameters. It will be emitted as required.`,
      },
    },
    "cookies-unsupported": {
      severity: "warning",
      messages: {
        default: `Cookies are not supported in Swagger 2.0. Parameter was ignored.`,
      },
    },
    "invalid-format": {
      severity: "warning",
      messages: {
        default: paramMessage`'${"schema"}' format '${"format"}' is not supported in Autorest. It will not be emitted.`,
      },
    },
    "unsupported-auth": {
      severity: "warning",
      messages: {
        default: paramMessage`Authentication "${"authType"}" is not a known authentication by the openapi3 emitter, it will be ignored.`,
      },
    },
    "no-matching-version-found": {
      severity: "error",
      messages: {
        default:
          "The emitter did not emit any files because the specified version option does not match any versions of the service.",
      },
    },
  },
  emitter: {
    options: EmitterOptionsSchema as JSONSchemaType<AutorestEmitterOptions>,
  },

  state: {
    example: { description: "State for the @example decorator" },
    useRef: { description: "State for the @useRef decorator" },
  },
} as const);

export const { reportDiagnostic, createDiagnostic, stateKeys: AutorestStateKeys, getTracer } = $lib;
