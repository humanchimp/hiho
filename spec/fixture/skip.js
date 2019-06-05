describe.skip("describe.skip", () => {
  describe("nested", () => {
    it("should be skipped", nope);

    describe("deeply nested", () => {
      it("should be skipped", nope);
    });
  });
});

describe.each.skip("describe.each.skip", [1, 2, 3], n => {
  describe("nested", () => {
    it(`should be skipped ${n}`, nope);

    describe("deeply nested", () => {
      it(`should be skipped ${n}`, nope);
    });
  });
});

function nope() {
  throw new Error();
}
