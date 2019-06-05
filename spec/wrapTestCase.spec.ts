import { expect } from "chai";
import { wrapTestCase } from "../src/wrapTestCase";

describe("when a nullary function is passed", () => {
  function nullary() {}

  it("should return that function itself", () => {
    expect(wrapTestCase(nullary)).to.equal(nullary);
  });
});

describe("when a unary function is passed", () => {
  /* eslint-disable */
  function unary(ignored) {}
  /* eslint-enable */

  it("should return a nullary function", () => {
    const subject = wrapTestCase(unary);

    expect(subject).not.to.equal(unary);
    expect(subject).to.have.lengthOf(0);
    expect(unary).to.have.lengthOf(1);
  });
});

describeEach(
  "larger arities",
  [
    /* eslint-disable */
    function binary(a, b) {},
    function ternary(a, b, c) {},
    function quaternary(a, b, c, d) {},
    function veternary(h, o, r, s, e) {},
    /* eslint-enable */
  ],
  testCase => {
    it("should throw an error about too many arugments", () => {
      expect(() => {
        wrapTestCase(testCase);
      }).to.throw(/too many arguments/);
    });
  },
);
