# @azure-tools/azure-http-specs

## 0.1.0-alpha.24

### Deprecations

- [#2974](https://github.com/Azure/typespec-azure/pull/2974) Deprecate pageable decorators `@Azure.Core.items` and `@Azure.Core.pagedResult`. Use `@TypeSpec.pageItems` and `@TypeSpec.list` instead.

### Features

- [#3083](https://github.com/Azure/typespec-azure/pull/3083) add spector test cases for `@legacy.hierarchyBuilding`
- [#3090](https://github.com/Azure/typespec-azure/pull/3090) Add test for enum with same name in different namespace.
- [#3094](https://github.com/Azure/typespec-azure/pull/3094) Add test for overload method in C# client code.

### Bug Fixes

- [#3086](https://github.com/Azure/typespec-azure/pull/3086) Fix missing list decorator


## 0.1.0-alpha.23

### Features

- [#2952](https://github.com/Azure/typespec-azure/pull/2952) Add test case for TCGC override

### Bump dependencies

- [#2867](https://github.com/Azure/typespec-azure/pull/2867) Upgrade dependencies


## 0.1.0-alpha.22

### Bump dependencies

- [#2867](https://github.com/Azure/typespec-azure/pull/2867) Upgrade dependencies

### Bug Fixes

- [#2901](https://github.com/Azure/typespec-azure/pull/2901) - Fixed ARM test template for large headers.
  - Fixed ARM mockapi for user-defined error case.


## 0.1.0-alpha.21

### Features

- [#2840](https://github.com/Azure/typespec-azure/pull/2840) feat: Add comprehensive ARM optional body template test cases
  
  Add test scenarios for Azure Resource Manager optional body templates including:
  - GET operation using Azure.ResourceManager.ArmResourceRead for resource retrieval
  - PATCH operation using Azure.ResourceManager.Legacy.CustomPatchSync with OptionalRequestBody = true
  - POST action operation using Azure.ResourceManager.ArmResourceActionSync with OptionalRequestBody = true  
  - POST provider action operation using Azure.ResourceManager.ArmProviderActionSync with OptionalRequestBody = true
  
  Each PATCH and POST operation tests both empty body and with-body scenarios using withServiceKeys to validate the optional request body functionality where operations can be called with or without sending a request body.

### Bump dependencies

- [#2867](https://github.com/Azure/typespec-azure/pull/2867) Upgrade dependencies


## 0.1.0-alpha.20

### Features

- [#2852](https://github.com/Azure/typespec-azure/pull/2852) Update `@usage` decorator tests to adopt new additive logic and add JSON serialization support
- [#2854](https://github.com/Azure/typespec-azure/pull/2854) Add comprehensive test scenarios for `@clientLocation` decorator

### Bump dependencies

- [#2867](https://github.com/Azure/typespec-azure/pull/2867) Upgrade dependencies


## 0.1.0-alpha.19

### Features

- [#2773](https://github.com/Azure/typespec-azure/pull/2773) [azure-http-specs] unscope paging with re-injection parameters test for go


## 0.1.0-alpha.18

### Features

- [#2677](https://github.com/Azure/typespec-azure/pull/2677) [azure-http-specs] add test for mgmt-plane large LRO header

### Bug Fixes

- [#2203](https://github.com/Azure/typespec-azure/pull/2203) Fix URL for ExtensionsResources in mockapi.


## 0.1.0-alpha.17

No changes, version bump only.

## 0.1.0-alpha.16

### Features

- [#2577](https://github.com/Azure/typespec-azure/pull/2577) Make use of new `dyn` values in definitions

### Bug Fixes

- [#2609](https://github.com/Azure/typespec-azure/pull/2609) Fix handler
- [#2571](https://github.com/Azure/typespec-azure/pull/2571) Add Java SDK namespace for _Specs_.Azure.ClientGenerator.Core.DeserializeEmptyStringAsNull
- [#2598](https://github.com/Azure/typespec-azure/pull/2598) Fix `.values` return value from parameterized next links


## 0.1.0-alpha.15

### Features

- [#2542](https://github.com/Azure/typespec-azure/pull/2542) Add test case of client initialization and child client
- [#2535](https://github.com/Azure/typespec-azure/pull/2535) add test for `Azure.ClientGenerator.Core.DeserializeEmptyStringAsNull`

### Bug Fixes

- [#2522](https://github.com/Azure/typespec-azure/pull/2522) Update to express v5
- [#2555](https://github.com/Azure/typespec-azure/pull/2555) Update next link to be fully qualified


## 0.1.0-alpha.14

### Features

- [#2496](https://github.com/Azure/typespec-azure/pull/2496) add tests for `@clientInitialization` moving from method to client
- [#2497](https://github.com/Azure/typespec-azure/pull/2497) add test for `Azure.Core.Legacy.parameterizedNextLink`

### Bug Fixes

- [#2527](https://github.com/Azure/typespec-azure/pull/2527) Fix FinalResult for POST LRO ArmCombinedLroHeaders.
- [#2522](https://github.com/Azure/typespec-azure/pull/2522) Update to express v5
- [#2530](https://github.com/Azure/typespec-azure/pull/2530) Fix client initialization spec issue.


## 0.1.0-alpha.13

### Bug Fixes

- [#2485](https://github.com/Azure/typespec-azure/pull/2485) Escape scenario as this is now keyword


## 0.1.0-alpha.12

### Bug Fixes

- [#2440](https://github.com/Azure/typespec-azure/pull/2440) Fix mockapi for flattenProperties and ARM


## 0.1.0-alpha.11

### Features

- [#2403](https://github.com/Azure/typespec-azure/pull/2403) Add test for non resource operations

### Bump dependencies

- [#2433](https://github.com/Azure/typespec-azure/pull/2433) Upgrade dependencies

### Bug Fixes

- [#2431](https://github.com/Azure/typespec-azure/pull/2431) Fix specs to handle body correctly with new spector change


## 0.1.0-alpha.10

### Bug Fixes

- [#2408](https://github.com/Azure/typespec-azure/pull/2408) Fix behavior change of contentType of string/bytes


## 0.1.0-alpha.9

### Features

- [#2379](https://github.com/Azure/typespec-azure/pull/2379) Add test for duration-constant format

### Bug Fixes

- [#2384](https://github.com/Azure/typespec-azure/pull/2384) Uptake changes to new reserved keywords


## 0.1.0-alpha.8

### Breaking Changes

- [#2309](https://github.com/Azure/typespec-azure/pull/2309) Minimum node version is now 20

### Features

- [#2318](https://github.com/Azure/typespec-azure/pull/2318) Add orphanModelSerializable operation to verify the JSON serialization of an orphan model
- [#2300](https://github.com/Azure/typespec-azure/pull/2300) azure-http-specs, add ARM Exception test case

### Bump dependencies

- [#2308](https://github.com/Azure/typespec-azure/pull/2308) Update dependencies


## 0.1.0-alpha.7

### Features

- [#2263](https://github.com/Azure/typespec-azure/pull/2263) Update azure core libraries to use Enum-based visibility modifiers instead of strings.

### Bug Fixes

- [#2224](https://github.com/Azure/typespec-azure/pull/2224) Add javascript change for clientNamespace cases


## 0.1.0-alpha.6

### Bug Fixes

- [#2087](https://github.com/Azure/typespec-azure/pull/2087) Add @apiVersion scenarios and mock apis

### Bump dependencies

- [#2109](https://github.com/Azure/typespec-azure/pull/2109) Upgrade dependencies


## 0.1.0-alpha.5

### Bug Fixes

- [#2039](https://github.com/Azure/typespec-azure/pull/2039) Add Rust to client naming scenarios

### Features

- [#1929](https://github.com/Azure/typespec-azure/pull/1929) Add test scenario for clientNamespace
- [#1934](https://github.com/Azure/typespec-azure/pull/1934) Added CheckNameAvailability operations case for ARM tests.
- [#1924](https://github.com/Azure/typespec-azure/pull/1924) Added ExtensionResource case for ARM tests.
- [#1933](https://github.com/Azure/typespec-azure/pull/1933) Added listing available operations case for ARM tests.
- [#1932](https://github.com/Azure/typespec-azure/pull/1932) Added Location-based Resource case for ARM tests.


## 0.1.0-alpha.4

### Bug Fixes

- [#1908](https://github.com/Azure/typespec-azure/pull/1908) Fix test scenario for singleton patch
- [#1910](https://github.com/Azure/typespec-azure/pull/1910) Fix a typo in access test scenario doc
- [#1886](https://github.com/Azure/typespec-azure/pull/1886) Replace usage of  `Azure.Core.nextLink`  to `TypeSpec.nextLink`.
- [#1950](https://github.com/Azure/typespec-azure/pull/1950) Update lockfile for core changes

### Features

- [#1925](https://github.com/Azure/typespec-azure/pull/1925) Move payload/pageable test scenario to azure folder
- [#1821](https://github.com/Azure/typespec-azure/pull/1821) Added LRO case for ARM tests.


## 0.1.0-alpha.3

Added scripts to package.json.

## 0.1.0-alpha.2

Backport changes from `cadl-ranch`.

## 0.1.0-alpha.1

No changes, version bump only.
