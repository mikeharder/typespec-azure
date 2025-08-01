import { deepStrictEqual } from "assert";
import { it } from "vitest";
import { compileOpenAPI } from "./test-host.js";

it("applies x-ms-client-flatten for property marked with @flattenProperty", async () => {
  const res = await compileOpenAPI(
    `
    model Widget {
      #suppress "deprecated" "for test"
      @flattenProperty
      properties?: WidgetProperties;
    }

    model WidgetProperties {
    }
    `,
    { preset: "azure" },
  );
  const model = res.definitions?.["Widget"]!;
  deepStrictEqual(model, {
    properties: {
      properties: {
        $ref: "#/definitions/WidgetProperties",
        "x-ms-client-flatten": true,
      },
    },
    type: "object",
  });
});
