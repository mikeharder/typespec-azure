import { Operation, Program, Type, createRule } from "@typespec/compiler";
import { getHeaderFieldName, isHeader } from "@typespec/http";
import { getOperationLink } from "../decorators/operation-link.js";
import {
  isExcludedCoreType,
  isTemplatedInterfaceOperation,
  isTemplatedOperationSignature,
} from "./utils.js";

function hasOperationLocation(program: Program, entity: Type): boolean {
  if (entity.kind === "Model") {
    for (const [_, prop] of entity.properties) {
      if (isHeader(program, prop)) {
        const header = getHeaderFieldName(program, prop);
        return header.toLowerCase() === "operation-location";
      }
    }
  }

  return false;
}

export const longRunningOperationsRequirePollingOperation = createRule({
  name: "long-running-polling-operation-required",
  description: "Long-running operations should have a linked polling operation.",
  severity: "warning",
  messages: {
    default:
      "This operation has an 'Operation-Location' header but no polling operation. Use the '@pollingOperation' decorator to link a status polling operation.",
  },
  create(context) {
    return {
      operation: (op: Operation) => {
        // Don't pay attention to operations on templated interfaces that
        // haven't been filled in with parameters yet
        if (
          !isTemplatedInterfaceOperation(op) &&
          !isTemplatedOperationSignature(op) &&
          !isExcludedCoreType(context.program, op)
        ) {
          // If the response has an Operation-Location header, require a polling endpoint.
          if (
            (op.returnType.kind === "Union" &&
              Array.from(op.returnType.variants.values()).find((v) =>
                hasOperationLocation(context.program, v.type),
              )) ||
            hasOperationLocation(context.program, op.returnType)
          ) {
            // Does the operation have a polling operation registered?
            if (!getOperationLink(context.program, op, "polling")) {
              context.reportDiagnostic({
                target: op,
              });
            }
          }
        }
      },
    };
  },
});
