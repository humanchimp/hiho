xdescribe("xdescribe", () => {
  describe("nested", () => {
    it("should be skipped", nope);

    describe("deeply nested", () => {
      it("should be skipped", nope);
    });
  });
});

xdescribeEach("xdescribeEach", [1, 2, 3], n => {
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
