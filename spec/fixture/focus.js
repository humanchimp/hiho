const memo = [];

describe("focus on a spec", () => {
  fit("this one is focused", () => {
    memo.push("first spec");
  });

  it("this one is not", () => {
    memo.put("second spec");
  });
});

fdescribe("focus on a suite", () => {
  it("this one is focused", () => {
    memo.push("third spec");
  });

  describe("nested", () => {
    it("this one is also focused", () => {
      memo.push("fourth spec");
    });

    describe("deeply nested", () => {
      it("even this one is focused", () => {
        memo.push("fifth spec");
      });
    });
  });
});

describe("verify", () => {
  fit("should have run only the focused specs", () => {
    expect(memo).to.eql([
      "first spec",
      "third spec",
      "fourth spec",
      "fifth spec",
    ]);
  });
});
