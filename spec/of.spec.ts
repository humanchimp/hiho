import { expect } from "chai";
import { Suite, of } from "../src";

describe(".of(...suites)", () => {
  it("makes a single Suite by combining its arguments", () => {
    const suite = of(new Suite("a"), new Suite("b"));

    expect(suite.description).to.be.null;
    expect(suite.suites.length).to.equal(2);
    expect(suite.suites[0].description).to.equal("a");
    expect(suite.suites[1].description).to.equal("b");
  });
});
