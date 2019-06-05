fdescribe("fdescribe", () => {
  describe("nested", () => {
    it("should be focused", yep);

    describe("deeply nested", () => {
      it("should be focused", yep);
    });
  });
});

fdescribeEach("fdescribeEach", [1, 2, 3], n => {
  describe("nested", () => {
    it(`should be focused ${n}`, yep);

    describe("deeply nested", () => {
      it(`should be focused ${n}`, yep);
    });
  });
});

function yep() {}
