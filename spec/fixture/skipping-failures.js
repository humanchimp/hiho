describe("skipping failed tests", () => {
  xit("should work", () => {
    throw new Error();
  });

  xit("should work", () => {
    throw new Error();
  });

  describe("a nested suite", () => {
    xit("should work", () => {
      throw new Error();
    });
  });

  xdescribe("a skipped suite", () => {
    it("should work", () => {
      throw new Error();
    });
  });
});
