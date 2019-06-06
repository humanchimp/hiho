import { expect } from "chai";
import { Suite, from } from "../src";

describe("from(suites)", () => {
  it("makes a single Suite by combining the items of the array passed as its first argument", () => {
    const suite = from([new Suite("a"), new Suite("b")]);

    expect(suite.description).to.be.null;
    expect(suite.suites.length).to.equal(2);
    expect(suite.suites[0].description).to.equal("a");
    expect(suite.suites[1].description).to.equal("b");
  });
});
