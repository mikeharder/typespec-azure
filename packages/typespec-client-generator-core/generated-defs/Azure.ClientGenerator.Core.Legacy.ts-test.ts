// An error in the imports would mean that the decorator is not exported or
// doesn't have the right name.

import { $decorators } from "@azure-tools/typespec-client-generator-core";
import type { AzureClientGeneratorCoreLegacyDecorators } from "./Azure.ClientGenerator.Core.Legacy.js";

/**
 * An error here would mean that the exported decorator is not using the same signature. Make sure to have export const $decName: DecNameDecorator = (...) => ...
 */
const _: AzureClientGeneratorCoreLegacyDecorators =
  $decorators["Azure.ClientGenerator.Core.Legacy"];
