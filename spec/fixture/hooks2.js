const memo = [];

describe("capture", () => {
  beforeAll(() => {
    memo.push("outer beforeAll 1");
  });

  afterAll(() => {
    memo.push("outer afterAll 1");
  });

  beforeAll(() => {
    memo.push("outer beforeAll 2");
  });

  afterAll(() => {
    memo.push("outer afterAll 2");
  });

  beforeEach(() => {
    memo.push("outer beforeEach 1");
  });

  afterEach(() => {
    memo.push("outer afterEach 1");
  });

  beforeEach(() => {
    memo.push("outer beforeEach 2");
  });

  afterEach(() => {
    memo.push("outer afterEach 2");
  });

  it("should run", () => {
    memo.push("first spec");
  });

  xit("should not run", () => {
    memo.push("second spec");
  });

  describe("suite", () => {
    beforeAll(() => {
      memo.push("inner beforeAll 1");
    });

    afterAll(() => {
      memo.push("inner afterAll 1");
    });

    beforeAll(() => {
      memo.push("inner beforeAll 2");
    });

    afterAll(() => {
      memo.push("inner afterAll 2");
    });

    beforeEach(() => {
      memo.push("inner beforeEach 1");
    });

    afterEach(() => {
      memo.push("inner afterEach 1");
    });

    beforeEach(() => {
      memo.push("inner beforeEach 2");
    });

    afterEach(() => {
      memo.push("inner afterEach 2");
    });

    it("should run", () => {
      memo.push("third spec");
    });

    xit("should not run", () => {
      memo.push("fourth spec");
    });

    describe("nested suite", () => {
      beforeAll(() => {
        memo.push("nested beforeAll 1");
      });

      afterAll(() => {
        memo.push("nested afterAll 1");
      });

      beforeAll(() => {
        memo.push("nested beforeAll 2");
      });

      afterAll(() => {
        memo.push("nested afterAll 2");
      });

      beforeEach(() => {
        memo.push("nested beforeEach 1");
      });

      afterEach(() => {
        memo.push("nested afterEach 1");
      });

      beforeEach(() => {
        memo.push("nested beforeEach 2");
      });

      afterEach(() => {
        memo.push("nested afterEach 2");
      });

      it("should run", () => {
        memo.push("fifth spec");
      });

      xit("should not run", () => {
        memo.push("sixth spec");
      });
    });
  });
});

describe("check", () => {
  it("should have fired the hooks in the expected order", () => {
    expect(memo).to.eql([
      "outer beforeAll 1",
      "outer beforeAll 2",

      // First spec
      "outer beforeEach 1",
      "outer beforeEach 2",
      "first spec",
      "outer afterEach 2",
      "outer afterEach 1",

      // Third spec
      "inner beforeAll 1",
      "inner beforeAll 2",
      "outer beforeEach 1",
      "outer beforeEach 2",
      "inner beforeEach 1",
      "inner beforeEach 2",
      "third spec",
      "inner afterEach 2",
      "inner afterEach 1",
      "outer afterEach 2",
      "outer afterEach 1",

      // Fifth spec
      "nested beforeAll 1",
      "nested beforeAll 2",
      "outer beforeEach 1",
      "outer beforeEach 2",
      "inner beforeEach 1",
      "inner beforeEach 2",
      "nested beforeEach 1",
      "nested beforeEach 2",
      "fifth spec",
      "nested afterEach 2",
      "nested afterEach 1",
      "inner afterEach 2",
      "inner afterEach 1",
      "outer afterEach 2",
      "outer afterEach 1",

      // Closure
      "nested afterAll 2",
      "nested afterAll 1",
      "inner afterAll 2",
      "inner afterAll 1",
      "outer afterAll 2",
      "outer afterAll 1",
    ]);
  });
});
