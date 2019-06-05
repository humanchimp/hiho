describe.only("describe.only", () => {
  describe("nested", () => {
    it("should be focused", yep);

    describe("deeply nested", () => {
      it("should be focused", yep);
    });
  });
});

describe.each.only("describe.each.only", [1, 2, 3], n => {
  describe("nested", () => {
    it(`should be focused ${n}`, yep);

    describe("deeply nested", () => {
      it(`should be focused ${n}`, yep);
    });
  });
});

describe.only.each("describe.only.each", [1, 2, 3], n => {
  describe("nested", () => {
    it(`should be focused ${n}`, yep);

    describe("deeply nested", () => {
      it(`should be focused ${n}`, yep);
    });
  });
});

function yep() {}
