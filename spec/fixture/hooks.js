const memo = [];

describe("hooks", () => {
  beforeAll(() => {
    memo.push("before all");
  });

  afterAll(() => {
    memo.push("after all");
  });

  beforeEach(() => {
    memo.push("before each");
  });

  afterEach(() => {
    memo.push("after each");
  });

  it("spec 1", () => {
    memo.push("spec 1");
  });

  it("spec 2", () => {
    memo.push("spec 2");
  });
});

describe("accumulation", () => {
  it("should have run the hooks in the correct order", () => {
    expect(memo).to.eql([
      "before all",
      "before each",
      "spec 1",
      "after each",
      "before each",
      "spec 2",
      "after each",
      "after all",
    ]);
  });
});
