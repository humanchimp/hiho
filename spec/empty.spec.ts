import { expect } from "chai";
import { empty } from "../src";

describe(".empty()", () => {
  it("should create an empty suite", () => {
    const suite = empty();

    expect(suite.description).to.be.null;
    expect(suite.suites.length).to.equal(0);
    expect(suite.specs.length).to.equal(0);
  });
});
