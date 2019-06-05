const spy = sinon.spy();

describe("throwing in a beforeAll", () => {
  beforeAll(nope);

  it("should not run", spy);

  it("should not run", spy);
});

describe("throwing async in a beforeAll", () => {
  beforeAll(nopeAsync);

  it("should not run", spy);

  it("should not run", spy);
});

describe("throwing in a beforeEach", () => {
  beforeEach(nope);

  it("should not run", spy);

  it("should not run", spy);
});

describe("throwing async in a beforeEach", () => {
  beforeEach(nopeAsync);

  it("should not run", spy);

  it("should not run", spy);
});

function nope() {
  throw new Error("nope");
}

function nopeAsync() {
  throw new Error("nope async");
}
