export const stacking = new Set([
  "describe",
  "xdescribe",
  "fdescribe",
  "describeEach",
  "xdescribeEach",
  "fdescribeEach",
]);

export const deferred = new Set([
  "it",
  "xit",
  "fit",
  "beforeAll",
  "afterAll",
  "beforeEach",
  "afterEach",
  "info",
]);

export const blocks = new Set([...stacking, ...deferred]);
