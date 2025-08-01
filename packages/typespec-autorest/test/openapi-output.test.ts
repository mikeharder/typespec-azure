import { expectDiagnostics } from "@typespec/compiler/testing";
import { deepStrictEqual, notStrictEqual, ok, strictEqual } from "assert";
import { describe, it } from "vitest";
import { compileOpenAPI, diagnoseOpenApiFor, oapiForModel } from "./test-host.js";

describe("typespec-autorest: definitions", () => {
  it("defines models", async () => {
    const res: any = await oapiForModel(
      "Foo",
      `model Foo {
        x: int32;
      };`,
    );

    ok(res.isRef);
    deepStrictEqual(res.defs.Foo, {
      type: "object",
      properties: {
        x: { type: "integer", format: "int32" },
      },
      required: ["x"],
    });
  });

  it("errors on duplicate model names", async () => {
    const diagnostics = await diagnoseOpenApiFor(
      `
      model P {
        p: string;
      }

      @friendlyName("P")
      model Q {
        q: string;
      }

      #suppress "@azure-tools/typespec-azure-core/use-standard-operations" "This is a test."
      @route("/test1")
      @get
      op test1(p: P): Q;
      `,
    );

    expectDiagnostics(diagnostics, [
      {
        code: "@typespec/openapi/duplicate-type-name",
        message: /type/,
      },
    ]);
  });

  it("doesn't define anonymous or unconnected models", async () => {
    const res: any = await oapiForModel(
      "{ ... Foo }",
      `model Foo {
        x: int32;
      };`,
    );

    ok(res.isRef);
    strictEqual(Object.keys(res.defs).length, 1);
    deepStrictEqual(res.useSchema, {
      $ref: "#/definitions/Foo",
    });
  });

  it("defines templated models", async () => {
    const res: any = await oapiForModel(
      "Foo<int32>",
      `model Foo<T> {
        x: T;
      };`,
    );

    ok(!res.isRef);
    deepStrictEqual(res.useSchema, {
      type: "object",
      properties: {
        x: { type: "integer", format: "int32" },
      },
      required: ["x"],
    });
  });

  it("defines templated models when template param is in a namespace", async () => {
    const res: any = await oapiForModel(
      "Foo<Test.M>",
      `
      namespace Test {
        model M {}
      }
      model Foo<T> {
        x: T;
      };`,
    );

    ok(!res.isRef);
    deepStrictEqual(res.useSchema, {
      type: "object",
      properties: {
        x: { $ref: "#/definitions/Test.M" },
      },
      required: ["x"],
    });
  });

  it("defines models extended from models", async () => {
    const res: any = await oapiForModel(
      "Bar",
      `
      model Foo {
        y: int32;
      };
      model Bar extends Foo {}`,
    );

    ok(res.isRef);
    ok(res.defs.Foo, "expected definition named Foo");
    ok(res.defs.Bar, "expected definition named Bar");
    deepStrictEqual(res.defs.Bar, {
      type: "object",
      allOf: [{ $ref: "#/definitions/Foo" }],
    });

    deepStrictEqual(res.defs.Foo, {
      type: "object",
      properties: { y: { type: "integer", format: "int32" } },
      required: ["y"],
    });
  });

  it("emits models extended from models when parent is emitted", async () => {
    const res: any = await compileOpenAPI(
      `
      model Parent {
        x?: int32;
      };
      model Child extends Parent {
        y?: int32;
      }
      @route("/") op test(): Parent;
      `,
    );
    deepStrictEqual(res.definitions.Parent, {
      type: "object",
      properties: { x: { type: "integer", format: "int32" } },
    });
    deepStrictEqual(res.definitions.Child, {
      type: "object",
      allOf: [{ $ref: "#/definitions/Parent" }],
      properties: { y: { type: "integer", format: "int32" } },
    });
  });

  it("ignore uninstantiated template types", async () => {
    const res: any = await compileOpenAPI(
      `
      model Parent {
        x?: int32;
      };
      @friendlyName("TParent_{name}", T)
      model TParent<T> extends Parent {
        t: T;
      }
      model Child extends TParent<string> {
        y?: int32;
      }
      @route("/") op test(): Parent;
      `,
    );
    ok(!("TParent" in res.definitions), "Parent templated type shouldn't be included in OpenAPI");
    deepStrictEqual(res.definitions.Parent, {
      type: "object",
      properties: { x: { type: "integer", format: "int32" } },
    });
    deepStrictEqual(res.definitions.TParent_string, {
      type: "object",
      properties: { t: { type: "string" } },
      required: ["t"],
      allOf: [{ $ref: "#/definitions/Parent" }],
    });
    deepStrictEqual(res.definitions.Child, {
      type: "object",
      allOf: [{ $ref: "#/definitions/TParent_string" }],
      properties: { y: { type: "integer", format: "int32" } },
    });
  });

  it("shouldn't emit instantiated template child types that are only used in is", async () => {
    const res: any = await compileOpenAPI(
      `
      model Parent {
        x?: int32;
      };
      model TParent<T> extends Parent {
        t: T;
      }
      model Child is TParent<string> {
        y?: int32;
      }
      @route("/") op test(): Parent;
      `,
    );
    ok(
      !("TParent_string" in res.definitions),
      "Parent instantiated templated type shouldn't be included in OpenAPI",
    );
  });

  it("defines models with properties extended from models", async () => {
    const res: any = await oapiForModel(
      "Bar",
      `
      model Foo {
        y: int32;
      };
      model Bar extends Foo {
        x: int32;
      }`,
    );

    ok(res.isRef);
    ok(res.defs.Foo, "expected definition named Foo");
    ok(res.defs.Bar, "expected definition named Bar");
    deepStrictEqual(res.defs.Bar, {
      type: "object",
      properties: { x: { type: "integer", format: "int32" } },
      allOf: [{ $ref: "#/definitions/Foo" }],
      required: ["x"],
    });

    deepStrictEqual(res.defs.Foo, {
      type: "object",
      properties: { y: { type: "integer", format: "int32" } },
      required: ["y"],
    });
  });

  it("defines models extended from templated models", async () => {
    const res: any = await oapiForModel(
      "Bar",
      `
      model Foo<T> {
        y: T;
      };
      model Bar extends Foo<int32> {}`,
    );

    ok(res.isRef);
    ok(res.defs["Foo_int32"] === undefined, "no definition named Foo_int32");
    ok(res.defs.Bar, "expected definition named Bar");
    deepStrictEqual(res.defs.Bar, {
      type: "object",
      properties: { y: { type: "integer", format: "int32" } },
      required: ["y"],
    });
  });

  it("defines models with properties extended from templated models", async () => {
    const res: any = await oapiForModel(
      "Bar",
      `
      model Foo<T> {
        y: T;
      };
      model Bar extends Foo<int32> {
        x: int32
      }`,
    );

    ok(res.isRef);
    ok(res.defs.Bar, "expected definition named Bar");
    deepStrictEqual(res.defs.Bar, {
      type: "object",
      properties: { x: { type: "integer", format: "int32" } },
      required: ["x"],
      allOf: [
        {
          type: "object",
          properties: { y: { type: "integer", format: "int32" } },
          required: ["y"],
        },
      ],
    });
  });

  it("defines templated models with properties extended from templated models", async () => {
    const res: any = await oapiForModel(
      "Bar<int32>",
      `
      @friendlyName("Foo_{name}", T)
      model Foo<T> {
        y: T;
      };
      @friendlyName("Bar_{name}", T)
      model Bar<T> extends Foo<T> {
        x: T
      }`,
    );

    ok(res.isRef);
    ok(res.defs.Foo_int32, "expected definition named Foo_int32");
    ok(res.defs.Bar_int32, "expected definition named Bar_int32");
    deepStrictEqual(res.defs.Bar_int32, {
      type: "object",
      properties: { x: { type: "integer", format: "int32" } },
      allOf: [{ $ref: "#/definitions/Foo_int32" }],
      required: ["x"],
    });

    deepStrictEqual(res.defs.Foo_int32, {
      type: "object",
      properties: { y: { type: "integer", format: "int32" } },
      required: ["y"],
    });
  });

  it("excludes response models with only headers", async () => {
    const res: any = await oapiForModel(
      "Foo",
      `
      model Foo { @statusCode code: 200, @header x: string};`,
    );

    ok(!res.isRef);
    deepStrictEqual(res.defs, {});
    deepStrictEqual(res.response, {
      description: "The request has succeeded.",
      headers: { x: { type: "string" } },
    });
  });

  it("defines models with no properties extended", async () => {
    const res: any = await oapiForModel(
      "Bar",
      `
      model Foo { x?: string};
      model Bar extends Foo {};`,
    );

    ok(res.isRef);
    ok(res.defs.Foo, "expected definition named Foo");
    ok(res.defs.Bar, "expected definition named Bar");
    deepStrictEqual(res.defs.Bar, {
      type: "object",
      allOf: [{ $ref: "#/definitions/Foo" }],
    });

    deepStrictEqual(res.defs.Foo, {
      type: "object",
      properties: { x: { type: "string" } },
    });
  });

  it("defines models with no properties extended twice", async () => {
    const res: any = await oapiForModel(
      "Baz",
      `
      model Foo { x: int32 };
      model Bar extends Foo {};
      model Baz extends Bar {};`,
    );

    ok(res.isRef);
    ok(res.defs.Foo, "expected definition named Foo");
    ok(res.defs.Bar, "expected definition named Bar");
    ok(res.defs.Baz, "expected definition named Baz");
    deepStrictEqual(res.defs.Baz, {
      type: "object",
      allOf: [{ $ref: "#/definitions/Bar" }],
    });

    deepStrictEqual(res.defs.Bar, {
      type: "object",
      allOf: [{ $ref: "#/definitions/Foo" }],
    });

    deepStrictEqual(res.defs.Foo, {
      type: "object",
      properties: {
        x: {
          format: "int32",
          type: "integer",
        },
      },
      required: ["x"],
    });
  });

  it("defines models with default properties", async () => {
    const res: any = await oapiForModel(
      "Pet",
      `
      model Pet {
        someString?: string = "withDefault"
      }
      `,
    );

    ok(res.isRef);
    ok(res.defs.Pet, "expected definition named Pet");
    deepStrictEqual(res.defs.Pet.properties.someString.default, "withDefault");
  });

  describe("unions", () => {
    it("emit a warning", async () => {
      const diagnostics = await diagnoseOpenApiFor(`
      model Pet {
        name: string | int32;
      };
      op test(): Pet;
      `);
      expectDiagnostics(diagnostics, {
        code: "@azure-tools/typespec-autorest/union-unsupported",
        message:
          "Unions cannot be emitted to OpenAPI v2 unless all options are literals of the same type.",
      });
    });

    it("produce an empty schema", async () => {
      const res: any = await oapiForModel(
        "Pet",
        `
      model Pet {
        #suppress "@azure-tools/typespec-autorest/union-unsupported" test
        name: string | int32;
      };
      `,
      );
      ok(res.isRef);
      deepStrictEqual(res.defs.Pet, {
        type: "object",
        properties: {
          name: {},
        },
        required: ["name"],
      });
    });

    it("overrides x-ms-enum.name with @clientName", async () => {
      const res: any = await compileOpenAPI(
        `
        @clientName("RenamedFoo")
        union Foo {
          foo: "foo",
          bar: "bar"
        }

        model FooResponse {
          foo: Foo;
        }`,
        { preset: "azure" },
      );
      const schema = res.definitions.RenamedFoo;
      deepStrictEqual(schema["x-ms-enum"].name, "RenamedFoo");
    });
  });

  it("recovers logical type name", async () => {
    const oapi: any = await compileOpenAPI(
      `
      model Thing {
        name?: string;
      }

      @route("/things/{id}")
      @get
      op get(@path id: string, @query test: string, ...Thing): Thing & { @header test: string; };
      `,
    );

    deepStrictEqual(oapi.definitions.Thing, {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
      },
    });

    deepStrictEqual(
      oapi.paths["/things/{id}"].get.parameters.find((p: any) => p.in === "body").schema,
      {
        $ref: "#/definitions/Thing",
      },
    );

    deepStrictEqual(oapi.paths["/things/{id}"].get.responses["200"].schema, {
      $ref: "#/definitions/Thing",
    });
  });
});

describe("typespec-autorest: literals", () => {
  const cases = [
    ["1", { type: "number", enum: [1] }],
    ['"hello"', { type: "string", enum: ["hello"], "x-ms-enum": { modelAsString: false } }],
    ["false", { type: "boolean", enum: [false] }],
    ["true", { type: "boolean", enum: [true] }],
  ];

  for (const test of cases) {
    it("knows schema for " + test[0], async () => {
      const res: any = await oapiForModel(
        "Pet",
        `
        model Pet { name: ${test[0]} };
        `,
      );

      const schema = res.defs.Pet.properties.name;
      deepStrictEqual(schema, test[1]);
    });
  }
});

describe("typespec-autorest: operations", () => {
  it("define operations with param with defaults", async () => {
    const res: any = await compileOpenAPI(`
      @get op read(@query queryWithDefault?: string = "defaultValue"): string;
    `);

    deepStrictEqual(res.paths["/"].get.parameters[0].default, "defaultValue");
  });

  it("define operations with param with decorators", async () => {
    const res: any = await compileOpenAPI(`
      @get
      @route("/thing/{name}")
      op getThing(
        @pattern("^[a-zA-Z0-9-]{3,24}$")
        @format("UUID")
        @path name: string,

        @minValue(1)
        @maxValue(10)
        @query count: int32
      ): string;
      `);

    const getThing = res.paths["/thing/{name}"].get;
    ok(getThing);
    ok(getThing.parameters[0].pattern);
    strictEqual(getThing.parameters[0].pattern, "^[a-zA-Z0-9-]{3,24}$");
    strictEqual(getThing.parameters[0].format, "UUID");

    ok(getThing.parameters[1].minimum);
    ok(getThing.parameters[1].maximum);
    strictEqual(getThing.parameters[1].minimum, 1);
    strictEqual(getThing.parameters[1].maximum, 10);
  });

  it("deprecate operations with #deprecated", async () => {
    const res: any = await compileOpenAPI(
      `
      #deprecated "use something else"
      op read(@query query: string): string;
      `,
    );

    strictEqual(res.paths["/"].get.deprecated, true);
  });

  it(`@clientName(<>) updates the operationId`, async () => {
    const res: any = await compileOpenAPI(
      `
      @service namespace MyService;
      @route("/op-only") @clientName( "clientCall") op serviceName(): void;

      @clientName( "ClientInterfaceName") 
      interface ServiceInterfaceName {
        @route("/interface-only") same(): void;
        @route("/interface-and-op") @clientName( "clientCall") serviceName(): void;
      }
      `,
      { preset: "azure" },
    );

    strictEqual(res.paths["/op-only"].get.operationId, "ClientCall");
    strictEqual(res.paths["/interface-only"].get.operationId, "ClientInterfaceName_Same");
    strictEqual(res.paths["/interface-and-op"].get.operationId, "ClientInterfaceName_ClientCall");
  });

  it(`@clientLocation with string target updates the operationId`, async () => {
    const res = await compileOpenAPI(
      `
      @service namespace MyService;
      
      interface TestInterface {
        @route("/test-string") @clientLocation("CustomGroup") op testOperation(): void;
      }
      `,
      { preset: "azure" },
    );

    strictEqual(res.paths["/test-string"].get?.operationId, "CustomGroup_TestOperation");
  });

  it(`@clientLocation with Interface target updates the operationId`, async () => {
    const res: any = await compileOpenAPI(
      `
      @service namespace MyService;
      
      interface TargetInterface {
        @route("/target-op") op targetOperation(): void;
      }
      
      interface SourceInterface {
        @route("/test-interface") @clientLocation(TargetInterface) op testOperation(): void;
      }
      `,
      { preset: "azure" },
    );

    strictEqual(res.paths["/test-interface"].get.operationId, "TargetInterface_TestOperation");
    // Original operation in the target interface should use its interface name as prefix
    strictEqual(res.paths["/target-op"].get.operationId, "TargetInterface_TargetOperation");
  });

  it(`@clientLocation with Namespace target updates the operationId`, async () => {
    const res: any = await compileOpenAPI(
      `
      @service namespace MyService;
      
      namespace CustomNamespace {
        @route("/custom-op") op customOperation(): void;
      }
      
      interface TestInterface {
        @route("/test-namespace") @clientLocation(CustomNamespace) op testOperation(): void;
        @route("/test-service") @clientLocation(MyService) op serviceOperation(): void;
      }
      `,
      { preset: "azure" },
    );

    // When target is a non-service namespace, use namespace name as prefix
    strictEqual(res.paths["/test-namespace"].get.operationId, "CustomNamespace_TestOperation");
    // When target is the service namespace, use operation name only
    strictEqual(res.paths["/test-service"].get.operationId, "ServiceOperation");
    // Original operation in the custom namespace should still use namespace prefix
    strictEqual(res.paths["/custom-op"].get.operationId, "CustomNamespace_CustomOperation");
  });
});

describe("typespec-autorest: request", () => {
  describe("binary request", () => {
    it("bytes request should produce byte format with application/json", async () => {
      const res: any = await compileOpenAPI(`
        @post op read(@body body: bytes): {};
      `);
      const operation = res.paths["/"].post;
      deepStrictEqual(operation.consumes, ["application/octet-stream"]);
      const requestBody = operation.parameters[0];
      ok(requestBody);
      strictEqual(requestBody.schema.type, "string");
      strictEqual(requestBody.schema.format, "binary");
    });

    it("bytes request should respect @header contentType", async () => {
      const res: any = await compileOpenAPI(`
        @post op read(@header contentType: "image/png", @body body: bytes): {};
      `);

      const operation = res.paths["/"].post;
      deepStrictEqual(operation.consumes, ["image/png"]);
      const requestBody = operation.parameters[0];
      ok(requestBody);
      strictEqual(requestBody.schema.type, "string");
      strictEqual(requestBody.schema.format, "binary");
    });
  });
});

describe("typespec-autorest: extension decorator", () => {
  it("adds an arbitrary extension to a model", async () => {
    const oapi: any = await compileOpenAPI(`
      @extension("x-model-extension", "foobar")
      model Pet {
        name: string;
      }
      @get op read(): Pet;
    `);
    ok(oapi.definitions.Pet);
    strictEqual(oapi.definitions.Pet["x-model-extension"], "foobar");
  });

  it("adds an arbitrary extension to an operation", async () => {
    const oapi: any = await compileOpenAPI(
      `
      model Pet {
        name: string;
      }
      @get()
      @extension("x-operation-extension", "barbaz")
      op list(): Pet[];
      `,
    );
    ok(oapi.paths["/"].get);
    strictEqual(oapi.paths["/"].get["x-operation-extension"], "barbaz");
  });

  it("adds an arbitrary extension to a parameter", async () => {
    const oapi: any = await compileOpenAPI(
      `
      model Pet {
        name: string;
      }
      model PetId {
        @path
        @extension("x-parameter-extension", "foobaz")
        petId: string;
      }
      @route("/Pets")
      @get op get(... PetId): Pet;
    `,
    );
    ok(oapi.paths["/Pets/{petId}"].get);
    strictEqual(oapi.paths["/Pets/{petId}"].get.parameters[0]["$ref"], "#/parameters/PetId");
    strictEqual(oapi.parameters.PetId.name, "petId");
    strictEqual(oapi.parameters.PetId["x-parameter-extension"], "foobaz");
  });

  it("support x-ms-identifiers with null array ", async () => {
    const oapi: any = await compileOpenAPI(
      `
      model Pet {
        name: string;
      }
      model PetList {
        value: Pet[]
      }
      @route("/Pets")
      @get op list(): PetList;
      `,
    );
    ok(oapi.paths["/Pets"].get);
    notStrictEqual(oapi.definitions.PetList.properties.value["x-ms-identifiers"], []);
  });
});

describe("identifiers decorator", () => {
  it("ignores name/id keys for x-ms-identifiers", async () => {
    const oapi: any = await compileOpenAPI(
      `
      model Pet {
        @key
        name: string;
        @key
        id: int32;
      }
      model PetList {
        value: Pet[]
      }
      `,
    );
    deepStrictEqual(oapi.definitions.PetList.properties.value["x-ms-identifiers"], undefined);
  });

  it("ignores name/id keys for x-ms-identifiers when nested", async () => {
    const oapi: any = await compileOpenAPI(
      `
      @armProviderNamespace
      @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
      namespace Microsoft.Test;

      model Bar {
        foo:Foo;
      }
      model BarList {
        value: Bar[]
      }
      model Foo
      {
        @key
        name:string;
      }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.BarList.properties.value["x-ms-identifiers"], undefined);
  });

  it("key decorator in x-ms-identifiers for nested scenarios ", async () => {
    const oapi: any = await compileOpenAPI(
      `
      @armProviderNamespace
      @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
      namespace Microsoft.Test;

      model Bar {
        foo:Foo;
      }
      model BarList {
        value: Bar[]
      }
      model Foo
      {
        @key
        value:string;
      }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.BarList.properties.value["x-ms-identifiers"], ["foo/value"]);
  });

  it("ignores id property for x-ms-identifiers", async () => {
    const oapi: any = await compileOpenAPI(
      `
      model Pet {
        name: string;
        id: int32;
      }
      model PetList {
        value: Pet[]
      }
      `,
    );
    deepStrictEqual(oapi.definitions.PetList.properties.value["x-ms-identifiers"], undefined);
  });
  it("uses identifiers decorator for properties", async () => {
    const oapi: any = await compileOpenAPI(
      `
      @armProviderNamespace
      @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
      namespace Microsoft.Test;
      
      model Pet {
        name: string;
        age: int32;
      }
      model PetList {
        @identifiers(#["age"])
        value: Pet[]
      }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.PetList.properties.value["x-ms-identifiers"], ["age"]);
  });
  it("identifies keys correctly as x-ms-identifiers", async () => {
    const oapi: any = await compileOpenAPI(
      `
      @armProviderNamespace
      @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
      namespace Microsoft.Test;
      
      model Pet {
        name: string;
        @key
        age: int32;
      }
      model PetList {
        value: Pet[]
      }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.PetList.properties.value["x-ms-identifiers"], ["age"]);
  });
  it("x-ms-identifiers ignores keys for non armProviderNamespace", async () => {
    const oapi: any = await compileOpenAPI(
      `
      model Pet {
        name: string;
        @key
        age: int32;
      }
      model PetList {
        value: Pet[]
      }
      `,
    );
    deepStrictEqual(oapi.definitions.PetList.properties.value["x-ms-identifiers"], undefined);
  });

  it("prioritizes identifiers decorator over keys", async () => {
    const oapi: any = await compileOpenAPI(
      `
      @armProviderNamespace
      @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
      namespace Microsoft.Test;      
      model Pet {
        name: string;
        @key
        age: int32;
      }
      model PetList {
        @identifiers(#[])
        value: Pet[]
      }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.PetList.properties.value["x-ms-identifiers"], []);
  });

  it("prioritizes identifiers decorator over id prop", async () => {
    const oapi: any = await compileOpenAPI(
      `
      @armProviderNamespace
      @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
      namespace Microsoft.Test;
      
      model Pet {
        name: string;
        id: string;
      }
      model PetList {
        @identifiers(#[])
        value: Pet[]
      }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.PetList.properties.value["x-ms-identifiers"], []);
  });

  it("supports multiple identifiers", async () => {
    const oapi: any = await compileOpenAPI(
      `
      @armProviderNamespace
      @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
      namespace Microsoft.Test;
      
      model Pet {
        name: string;
        age: int32;
      }
      model PetList {
        @identifiers(#["name", "age"])
        value: Pet[]
      }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.PetList.properties.value["x-ms-identifiers"], ["name", "age"]);
  });
  it("supports inner properties in identifiers decorator", async () => {
    const oapi: any = await compileOpenAPI(
      `
        @armProviderNamespace
        @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
        namespace Microsoft.Test;
      
        model Pet {
          dogs: Dog;
        }
        
        model Dog {
          breed: string;
        }
        
        model PetList {
          @identifiers(#["dogs/breed"])
          pets: Pet[]
        }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.PetList.properties.pets["x-ms-identifiers"], ["dogs/breed"]);
  });
  it("support inner models in different namespace but route models should be on armProviderNamespace", async () => {
    const oapi: any = await compileOpenAPI(
      `
        @armProviderNamespace
        @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
        namespace Microsoft.Test
        {
        
          @route("/Pets")
          @get op list(): PetList;
        
          model PetList {
            @identifiers(#["age"])
            pets: Microsoft.Modeling.Pet[]
          }
        }
        
        namespace Microsoft.Modeling
        {
          model Pet {
            age: int32;
          }
        }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.PetList.properties.pets["x-ms-identifiers"], ["age"]);
  });
  it("supports inner properties for keys", async () => {
    const oapi: any = await compileOpenAPI(
      `
        @armProviderNamespace
        @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
        namespace Microsoft.Test;
        
        model Pet {
          dogs: Dog;
          cats: Cat;
        }
         
        model Dog {
          @key
          breed: string;
        }
        
        model Cat
        {
          features: Features;
        }
        
        model Features {
            @key
            color:string;
            size:int32;
        }
        
        model PetList {
          pets: Pet[]
        }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.PetList.properties.pets["x-ms-identifiers"], [
      "dogs/breed",
      "cats/features/color",
    ]);
  });
  it("`@identifiers` are assigned by model property", async () => {
    const oapi: any = await compileOpenAPI(
      `
      @armProviderNamespace
      @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
      namespace Microsoft.Test;
      
      model Pet {
        name: string;
        id: int32;
      }
      model PetList {
        @identifiers(#["name"])
        value: Pet[]
      }
      model PetList2 {
        @identifiers(#["id"])
        value: Pet[]
      }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.PetList.properties.value["x-ms-identifiers"], ["name"]);
    deepStrictEqual(oapi.definitions.PetList2.properties.value["x-ms-identifiers"], ["id"]);
  });
  it("`@identifiers` are assigned to `armProviderNamespace` properties even when nested in another namespace", async () => {
    const oapi: any = await compileOpenAPI(
      `
      @armProviderNamespace
      @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
      namespace Microsoft.Test;
      
      model PetResource is TrackedResource<PetResourceProperties> {
        @key("petResourceName")
        @segment("petServices")
        name: string;
      }

      model PetResourceProperties {
        @identifiers(#["key"])
        pets?: PetTypes[];
      }

      model PetTypes {
        key: string;
        value: string;
      }

      @armResourceOperations(PetResource)
      interface PetService {
        update is ArmCustomPatchAsync<
          PetResource,
          Azure.ResourceManager.Foundations.ResourceUpdateModel<
            PetResource,
            PetResourceProperties
          >
        >;
      }
      `,
      { preset: "azure" },
    );
    deepStrictEqual(oapi.definitions.PetResourceProperties.properties.pets["x-ms-identifiers"], [
      "key",
    ]);
    deepStrictEqual(
      oapi.definitions.PetResourceUpdateProperties.properties.pets["x-ms-identifiers"],
      ["key"],
    );
  });
});
