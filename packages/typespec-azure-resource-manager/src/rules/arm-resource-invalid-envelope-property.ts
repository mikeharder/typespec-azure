import { Model, ModelProperty, createRule, isKey, paramMessage } from "@typespec/compiler";

import { getArmResource } from "../resource.js";
import { getNamespaceName, getSourceModel } from "./utils.js";

export const armResourceEnvelopeProperties = createRule({
  name: "arm-resource-invalid-envelope-property",
  severity: "warning",
  description: "Check for invalid resource envelope properties.",
  messages: {
    default: paramMessage`Property "${"propertyName"}" is not valid in the resource envelope.  Please remove this property, or add it to the resource-specific property bag.`,
  },
  create(context) {
    return {
      model: (model: Model) => {
        const resourceModel = getArmResource(context.program, model);
        if (resourceModel !== undefined) {
          for (const property of getProperties(model)) {
            if (property.name !== "name" && !isKey(context.program, property)) {
              const sourceModel = getSourceModel(property);
              const sourceNamespace = getNamespaceName(context.program, sourceModel);
              if (
                sourceModel === undefined ||
                sourceNamespace === undefined ||
                !sourceNamespace.startsWith("Azure.ResourceManager")
              ) {
                context.reportDiagnostic({
                  format: { propertyName: property.name },
                  target: property,
                });
              }
            }
          }
        }
      },
    };

    function getProperties(model: Model): ModelProperty[] {
      const result: ModelProperty[] = [];
      let current: Model | undefined = model;
      while (current !== undefined) {
        if (current.properties.size > 0) result.push(...current.properties.values());
        current = current.baseModel;
      }

      return result;
    }
  },
});
