import { expectDiagnostics } from "@typespec/compiler/testing";
import { ok, strictEqual } from "assert";
import { beforeEach, it } from "vitest";
import { SdkHttpOperation, SdkServiceMethod } from "../../src/interfaces.js";
import { SdkTestRunner, createSdkTestRunner } from "../test-host.js";

let runner: SdkTestRunner;

beforeEach(async () => {
  runner = await createSdkTestRunner({
    emitterName: "@azure-tools/typespec-java",
    "examples-dir": `./examples`,
  });
});

it("example config", async () => {
  runner = await createSdkTestRunner({
    emitterName: "@azure-tools/typespec-java",
    "examples-dir": `./examples`,
  });

  await runner.host.addRealTypeSpecFile("./examples/get.json", `${__dirname}/load/get.json`);
  await runner.compile(`
    @service
    namespace TestClient {
      op get(): string;
    }
  `);

  const operation = (
    runner.context.sdkPackage.clients[0].methods[0] as SdkServiceMethod<SdkHttpOperation>
  ).operation;
  ok(operation);
  strictEqual(operation.examples?.length, 1);
  strictEqual(operation.examples![0].filePath, "get.json");
});

it("example default config", async () => {
  runner = await createSdkTestRunner({
    emitterName: "@azure-tools/typespec-java",
  });

  await runner.host.addRealTypeSpecFile("./examples/get.json", `${__dirname}/load/get.json`);
  await runner.compile(`
    @service
    namespace TestClient {
      op get(): string;
    }
  `);

  const operation = (
    runner.context.sdkPackage.clients[0].methods[0] as SdkServiceMethod<SdkHttpOperation>
  ).operation;
  ok(operation);
  strictEqual(operation.examples?.length, 1);
  strictEqual(operation.examples![0].filePath, "get.json");
});

it("no example folder found", async () => {
  await runner.compile(`
    @service
    namespace TestClient {
      op get(): string;
    }
  `);

  expectDiagnostics(runner.context.diagnostics, {
    code: "@azure-tools/typespec-client-generator-core/example-loading",
  });
});

it("load example without version", async () => {
  await runner.host.addRealTypeSpecFile("./examples/get.json", `${__dirname}/load/get.json`);
  await runner.compile(`
    @service
    namespace TestClient {
      op get(): string;
    }
  `);

  const operation = (
    runner.context.sdkPackage.clients[0].methods[0] as SdkServiceMethod<SdkHttpOperation>
  ).operation;
  ok(operation);
  strictEqual(operation.examples?.length, 1);
  strictEqual(operation.examples![0].filePath, "get.json");
});

it("load example with version", async () => {
  await runner.host.addRealTypeSpecFile("./examples/v3/get.json", `${__dirname}/load/get.json`);
  await runner.compile(`
    @service
    @versioned(Versions)
    namespace TestClient {
      op get(): string;
    }

    enum Versions {
      v1,
      v2,
      v3,
    }
  `);

  const operation = (
    runner.context.sdkPackage.clients[0].methods[0] as SdkServiceMethod<SdkHttpOperation>
  ).operation;
  ok(operation);
  strictEqual(operation.examples?.length, 1);
  strictEqual(operation.examples![0].filePath, "v3/get.json");
});

it("load multiple example for one operation", async () => {
  await runner.host.addRealTypeSpecFile("./examples/get.json", `${__dirname}/load/get.json`);
  await runner.host.addRealTypeSpecFile(
    "./examples/getAnother.json",
    `${__dirname}/load/getAnother.json`,
  );
  await runner.compile(`
      @service
      namespace TestClient {
        op get(): string;
      }
    `);

  const operation = (
    runner.context.sdkPackage.clients[0].methods[0] as SdkServiceMethod<SdkHttpOperation>
  ).operation;
  ok(operation);
  strictEqual(operation.examples?.length, 2);
  strictEqual(operation.examples![0].filePath, "get.json");
  strictEqual(operation.examples![1].filePath, "getAnother.json");
});

it("load example with client customization", async () => {
  await runner.host.addRealTypeSpecFile("./examples/get.json", `${__dirname}/load/get.json`);
  await runner.compile(`
    @service
    namespace TestClient {
      op get(): string;
    }
  `);

  await runner.compileWithCustomization(
    `
      @service
      namespace TestClient {
        op get(): string;
      }
    `,
    `
      @client({
        name: "FooClient",
        service: TestClient
      })
      namespace Customizations {
        op test is TestClient.get;
      }
    `,
  );

  const client = runner.context.sdkPackage.clients[0];
  strictEqual(client.name, "FooClient");
  const method = client.methods[0] as SdkServiceMethod<SdkHttpOperation>;
  ok(method);
  strictEqual(method.name, "test");
  const operation = method.operation;
  ok(operation);
  strictEqual(operation.examples?.length, 1);
});

it("load multiple example with @clientName", async () => {
  await runner.host.addRealTypeSpecFile(
    "./examples/clientName.json",
    `${__dirname}/load/clientName.json`,
  );
  await runner.host.addRealTypeSpecFile(
    "./examples/clientNameAnother.json",
    `${__dirname}/load/clientNameAnother.json`,
  );
  await runner.compile(`
    @service
    namespace TestClient {
      @clientName("renamedNS")
      namespace NS {
        @route("/ns")
        @clientName("renamedOP")
        op get(): string;
      }

      @clientName("renamedIF")
      namespace IF {
        @route("/if")
        @clientName("renamedOP")
        op get(): string;
      }
    }
  `);

  const mainClient = runner.context.sdkPackage.clients[0];

  const nsClient = mainClient.children?.find((client) => client.name === "renamedNS");
  ok(nsClient);
  const operation1 = (nsClient.methods[0] as SdkServiceMethod<SdkHttpOperation>).operation;
  ok(operation1);
  strictEqual(operation1.examples?.length, 1);

  const ifClient = mainClient.children?.find((client) => client.name === "renamedIF");
  ok(ifClient);
  const operation2 = (ifClient.methods[0] as SdkServiceMethod<SdkHttpOperation>).operation;
  ok(operation2);
  strictEqual(operation2.examples?.length, 1);
});

it("load multiple example of original operation id with @clientName", async () => {
  await runner.host.addRealTypeSpecFile(
    "./examples/clientNameOriginal.json",
    `${__dirname}/load/clientNameOriginal.json`,
  );
  await runner.host.addRealTypeSpecFile(
    "./examples/clientNameAnotherOriginal.json",
    `${__dirname}/load/clientNameAnotherOriginal.json`,
  );
  await runner.compile(`
    @service
    namespace TestClient {
      @clientName("renamedNS")
      namespace NS {
        @route("/ns")
        @clientName("renamedOP")
        op get(): string;
      }

      @clientName("renamedIF")
      namespace IF {
        @route("/if")
        @clientName("renamedOP")
        op get(): string;
      }
    }
  `);

  const mainClient = runner.context.sdkPackage.clients[0];

  const nsClient = mainClient.children?.find((client) => client.name === "renamedNS");
  ok(nsClient);
  const operation1 = (nsClient.methods[0] as SdkServiceMethod<SdkHttpOperation>).operation;
  ok(operation1);
  strictEqual(operation1.examples?.length, 1);

  const ifClient = mainClient.children?.find((client) => client.name === "renamedIF");
  ok(ifClient);
  const operation2 = (ifClient.methods[0] as SdkServiceMethod<SdkHttpOperation>).operation;
  ok(operation2);
  strictEqual(operation2.examples?.length, 1);
});

it("ensure ordering for multiple examples", async () => {
  await runner.host.addRealTypeSpecFile("./examples/a_b_c.json", `${__dirname}/load/a_b_c.json`);
  await runner.host.addRealTypeSpecFile("./examples/a_b.json", `${__dirname}/load/a_b.json`);
  await runner.host.addRealTypeSpecFile("./examples/a.json", `${__dirname}/load/a.json`);
  await runner.compile(`
    @service
    namespace TestClient {
      op get(): string;
    }
  `);

  const operation = (
    runner.context.sdkPackage.clients[0].methods[0] as SdkServiceMethod<SdkHttpOperation>
  ).operation;
  ok(operation);
  strictEqual(operation.examples?.length, 3);
  strictEqual(operation.examples![0].filePath, "a.json");
  strictEqual(operation.examples![1].filePath, "a_b.json");
  strictEqual(operation.examples![2].filePath, "a_b_c.json");
});

it("load example with @clientLocation existed interface", async () => {
  await runner.host.addRealTypeSpecFile(
    "./examples/clientLocationAnotherInterface.json",
    `${__dirname}/load/clientLocationAnotherInterface.json`,
  );
  await runner.compile(`
    @service
    namespace TestClient {
      interface OriginalInterface {
        @clientLocation(AnotherInterface)
        op clientLocation(): string;
      }

      interface AnotherInterface {
      }
    }
  `);

  const mainClient = runner.context.sdkPackage.clients[0];

  const client = mainClient.children?.find((client) => client.name === "AnotherInterface");
  ok(client);
  const operation = (client.methods[0] as SdkServiceMethod<SdkHttpOperation>).operation;
  ok(operation);
  strictEqual(operation.examples?.length, 1);
});

it("load example with @clientLocation new operation group", async () => {
  await runner.host.addRealTypeSpecFile(
    "./examples/clientLocationNewOperationGroup.json",
    `${__dirname}/load/clientLocationNewOperationGroup.json`,
  );
  await runner.compile(`
    @service
    namespace TestClient {
      interface OriginalInterface {
        @clientLocation("NewOperationGroup")
        op clientLocation(): string;
      }
    }
  `);

  const mainClient = runner.context.sdkPackage.clients[0];

  const client = mainClient.children?.find((client) => client.name === "NewOperationGroup");
  ok(client);
  const operation = (client.methods[0] as SdkServiceMethod<SdkHttpOperation>).operation;
  ok(operation);
  strictEqual(operation.examples?.length, 1);
});

it("load example with @clientLocation root client", async () => {
  await runner.host.addRealTypeSpecFile(
    "./examples/clientLocationRootClient.json",
    `${__dirname}/load/clientLocationRootClient.json`,
  );
  await runner.compile(`
    @service
    namespace TestClient {
      interface OriginalInterface {
        @clientLocation(TestClient)
        op clientLocation(): string;
      }
    }
  `);

  const mainClient = runner.context.sdkPackage.clients[0];
  const operation = (mainClient.methods[0] as SdkServiceMethod<SdkHttpOperation>).operation;
  ok(operation);
  strictEqual(operation.examples?.length, 1);
});

it("nested examples", async () => {
  runner = await createSdkTestRunner({
    emitterName: "@azure-tools/typespec-java",
    "examples-dir": `./examples`,
  });

  await runner.host.addRealTypeSpecFile("./examples/nested/get.json", `${__dirname}/load/get.json`);
  await runner.compile(`
    @service
    namespace TestClient {
      op get(): string;
    }
  `);

  const operation = (
    runner.context.sdkPackage.clients[0].methods[0] as SdkServiceMethod<SdkHttpOperation>
  ).operation;
  ok(operation);
  strictEqual(operation.examples?.length, 1);
  strictEqual(operation.examples![0].filePath, "nested/get.json");
});
