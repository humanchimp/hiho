/* eslint no-undef: off, no-unused-vars: off, @typescript-eslint/no-unused-vars: off */
import { expect } from "chai";
import { spy, SinonSpy } from "sinon";
import { ISuite } from "../src/interfaces";
import { Suite } from "../src/Suite";
import { Hooks } from "../src/Hooks";
import { Listeners } from "../src/Listeners";
import { describe as createSuite } from "../src/describe";
import { specNamesForSuite } from "./util/specNamesForSuite";
import { exhaust } from "./util/exhaust";
import { accumulate } from "./util/accumulate";

describe("static factories/explicit casts", () => {
  let suites: Suite[], subject: Suite;

  beforeEach(() => {
    suites = [createSuite("a"), createSuite("b")];
  });

  describe("Suite.from(suites)", () => {
    describe("when the array contains a single suite", () => {
      beforeEach(() => {
        subject = Suite.from([suites[0]]);
      });

      it("should return the suite itself", () => {
        expect(subject).to.equal(suites[0]);
      });
    });

    describe("when the array contains multiple suites", () => {
      beforeEach(() => {
        subject = Suite.from(suites);
      });

      it("should be instance of Suite", () => {
        expect(subject).to.be.instanceOf(Suite);
      });

      it("should reduce an array of suites to a single suite", () => {
        expect(subject.suites).to.eql(suites);
      });

      it("should have a null description", () => {
        expect(subject.description).to.be.null;
      });
    });
  });

  describe("Suite.of(...suites)", () => {
    beforeEach(() => {
      spy(Suite, "from");
      subject = Suite.of(...suites);
    });

    afterEach(() => {
      (Suite.from as SinonSpy).restore();
    });

    it("should delegate to Suite.from", () => {
      expect((Suite.from as SinonSpy).calledOnce).to.be.true;
    });

    it("should be called with the splatted rest param", () => {
      expect((Suite.from as SinonSpy).getCall(0).args[0]).to.eql(suites);
    });
  });
});

describe("Suite.reducer", () => {
  let subject: Suite;

  beforeEach(() => {
    subject = [
      new Suite(null).it("a"),
      new Suite(null).it("b"),
      new Suite(null).it("c"),
    ].reduce(Suite.reducer);
  });

  it("should return a reducer that can be used to reduce an array of Suites to single Suite", async () => {
    expect(await specNamesForSuite(subject)).to.eql(["a", "b", "c"]);
  });
});

describe("new Suite(description)", () => {
  const description = "yep fancy description";
  let subject: Suite;

  beforeEach(() => {
    subject = new Suite(description);
  });

  it("should produce a new instance of Suite", () => {
    expect(subject).to.be.instanceOf(Suite);
  });

  describe(".description", () => {
    it("should have the given description", () => {
      expect(subject.description).to.equal(description);
    });
  });

  describe(".parent", () => {
    it("should be undefined", () => {
      expect(subject.parent).to.be.undefined;
    });
  });

  describe(".skipped", () => {
    it("should be false", () => {
      expect(subject.skipped).to.be.false;
    });
  });

  describe(".focused", () => {
    it("should not be focued", () => {
      expect(subject.focused).to.be.false;
    });
  });

  describe(".hooks", () => {
    it("should be an instance of Hooks", () => {
      expect(subject.hooks).to.be.instanceOf(Hooks);
    });

    it("should be empty", () => {
      expect(subject.hooks).to.eql({
        beforeAll: [],
        afterAll: [],
        beforeEach: [],
        afterEach: [],
      });
    });
  });

  describe(".listeners", () => {
    it("should be an instance of Listeners", () => {
      expect(subject.listeners).to.be.instanceOf(Listeners);
    });

    it("should be empty", () => {
      expect(subject.listeners).to.eql({
        pending: [],
        complete: [],
      });
    });
  });

  describe(".isFocusMode", () => {
    it("should be false", () => {
      expect(subject.isFocusMode).to.be.false;
    });

    it("can be toggled", () => {
      subject.isFocusMode = true;
      expect(subject.isFocusMode).to.be.true;
      subject.isFocusMode = false;
      expect(subject.isFocusMode).to.be.false;
      subject.isFocusMode = true;
      expect(subject.isFocusMode).to.be.true;
    });

    describe("semantics when enabled", () => {
      let spec1Spy, spec2Spy, spec4Spy;

      beforeEach(() => {
        spec1Spy = spy();
        spec2Spy = spy();
        spec4Spy = spy();

        subject
          .it("test 1", spec1Spy)
          .it("test 2", spec2Spy)
          .it("stub")
          .xit("skipped", spec4Spy);

        subject.isFocusMode = true;
      });

      it("means that by default children are skipped", async () => {
        for await (const report of subject.reports()) {
          expect(report.skipped).to.be.true;
          expect(report.ok).to.be.true;
        }
      });

      it("means that children can be focused explictly to run", async () => {
        const focusedSpy = spy();

        subject.fit("i will run", focusedSpy);
        await exhaust(subject.reports());
        expect(focusedSpy.calledOnce).to.be.true;
      });

      it("means that children are focused if their parent is focused", async () => {
        const focusedSpy = spy();

        subject.fdescribe("focused", s => {
          s.it("test", focusedSpy);
        });
        await exhaust(subject.reports());
        expect(focusedSpy.calledOnce).to.be.true;
      });

      it("means that decendants are focused if their ancestor is focused", async () => {
        const focusedSpy = spy();

        subject.fdescribe("focused", s => {
          s.describe("implicitly focused", s2 => {
            s2.it("test", focusedSpy);
          });
        });
        await exhaust(subject.reports());
        expect(focusedSpy.calledOnce).to.be.true;
      });

      it("is possible to skip specs that have focused parents", async () => {
        const focusedSpy = spy();

        subject.fdescribe("focused", s => {
          s.xit("test", focusedSpy);
        });
        await exhaust(subject.reports());
        expect(focusedSpy.called).to.be.false;
      });

      it("is possible to skip suites that have focused parents", async () => {
        const focusedSpy = spy();

        subject.fdescribe("focused", s => {
          s.xdescribe("test", s2 => {
            s2.it("would run but its parent is skipped", focusedSpy);
          });
        });
        await exhaust(subject.reports());
        expect(focusedSpy.called).to.be.false;
      });

      it("is currently the case that skipping trumps focusing", async () => {
        const focusedSpy = spy();

        subject.fdescribe("focused", s => {
          s.xdescribe("test", s2 => {
            s2.fit("would run but its parent is skipped", focusedSpy);
          });
        });
        await exhaust(subject.reports());
        expect(focusedSpy.called).to.be.false;
      });

      afterEach(() => {
        expect(spec1Spy.called).to.be.false;
        expect(spec2Spy.called).to.be.false;
        expect(spec4Spy.called).to.be.false;
      });
    });

    describe("downward propagation and fanout", () => {
      beforeEach(() => {
        subject.describe("outer 1", s =>
          s
            .describe("inner 1", s2 =>
              s2.describe("nested 1", noop).describe("nested 2", noop),
            )
            .describe("inner 2", s2 =>
              s2.describe("nested 3", noop).describe("nested 4", noop),
            ),
        );
        subject.describe("outer 2", s =>
          s
            .describe("inner 3", s2 =>
              s2.describe("nested 5", noop).describe("nested 6", noop),
            )
            .describe("inner 4", s2 =>
              s2.describe("nested 7", noop).describe("nested 8", noop),
            ),
        );
      });

      describe("when set to true", () => {
        beforeEach(() => {
          subject.isFocusMode = true;
        });

        it("should propagate downward, and fan out", () => {
          checkIsFocusModeDeeply(subject, true);
        });

        it("should not be possible to unset", () => {
          subject.isFocusMode = false;
          checkIsFocusModeDeeply(subject, true);
        });
      });

      function checkIsFocusModeDeeply(suite, expected) {
        for (const s of suite.suites) {
          expect(s.isFocusMode).to.equal(expected);
          for (const s2 of s.suites) {
            expect(s2.isFocusMode).to.equal(expected);
            for (const s3 of s2.suites) {
              expect(s3.isFocusMode).to.equal(expected);
            }
          }
        }
      }
    });
  });

  describe(".isDeeplyFocused", () => {
    it("should be false by default", () => {
      expect(subject.isDeeplyFocused).to.be.false;
    });

    describe("when the suite itself is focused", () => {
      beforeEach(() => {
        subject.focused = true;
      });

      it("should be false", () => {
        expect(subject.isDeeplyFocused).to.be.false;
      });
    });

    describe("when a child spec is focused", () => {
      beforeEach(() => {
        subject.fit("focused", noop).it("not focused for control sake");
      });

      it("should be true", () => {
        expect(subject.isDeeplyFocused).to.be.true;
      });
    });

    describe("when a child suite is focused", () => {
      beforeEach(() => {
        subject
          .fdescribe("focused", noop)
          .describe("not focused for control sake", noop);
      });

      it("should be true", () => {
        expect(subject.isDeeplyFocused).to.be.true;
      });
    });

    describe("when a descendant spec is focused", () => {
      beforeEach(() => {
        subject.describe("outer", s => {
          s.describe("inner 1", s2 => {
            s2.fit("focused", noop).it("not focused for control sake");
          }).describe("inner 2", s2 => {
            s2.it("not focused for control sake");
          });
        });
      });

      it("should be true", () => {
        expect(subject.isDeeplyFocused).to.be.true;
      });
    });

    describe("when a descendant suite is focused", () => {
      beforeEach(() => {
        subject.describe("outer", s => {
          s.fdescribe("focused", noop).describe(
            "not focused for control sake",
            noop,
          );
        });
      });

      it("should be true", () => {
        expect(subject.isDeeplyFocused).to.be.true;
      });
    });

    describe("when no descendant suite or spec is focused", () => {
      beforeEach(() => {
        subject.describe("outer", s => {
          s.describe("inner 1", s2 => {
            s2.it("not focused for control sake").it(
              "not focused for control sake",
            );
          }).describe("inner 2", s2 => {
            s2.it("not focused for control sake").it(
              "not focused for control sake",
            );
          });
        });
      });

      it("should be false", () => {
        expect(subject.isDeeplyFocused).to.be.false;
      });
    });

    it("is read only", () => {
      expect(() => {
        (subject as any).isDeeplyFocused = true;
      }).to.throw(TypeError);
    });
  });

  describeEach(
    "method signature which appends a spec",
    [
      [
        ".it(description)",
        desc => subject.it(desc),
        {
          skipped: true,
          focused: false,
          test: undefined,
        },
      ],
      [
        ".it(description, closure)",
        desc => subject.it(desc, noop),
        {
          skipped: false,
          focused: false,
          test: noop,
        },
      ],
      [
        ".xit(description)",
        desc => subject.xit(desc),
        {
          skipped: true,
          focused: false,
          test: undefined,
        },
      ],
      [
        ".xit(description, closure)",
        desc => subject.xit(desc, noop),
        {
          skipped: true,
          focused: false,
          test: noop,
        },
      ],
      [
        ".fit(description, thunk)",
        desc => subject.fit(desc, noop),
        {
          skipped: false,
          focused: true,
          test: noop,
        },
      ],
    ],
    ([signature, thunk, expected]) => {
      beforeEach(() => {
        expect(subject.specs).to.have.lengthOf(0);
      });

      const specDescription = `test case: ${signature}`;

      describe(signature, () => {
        beforeEach(() => {
          expect(thunk(specDescription), "it returns `this`").to.equal(subject);
        });

        it("should append a spec", () => {
          expect(subject.specs).to.have.lengthOf(1);
        });

        describe("the appended spec", () => {
          let spec;

          beforeEach(() => {
            [spec] = subject.specs;
          });

          it("should reflect skipped", () => {
            expect(spec.skipped).to.equal(expected.skipped);
          });

          it("should reflect focused", () => {
            expect(spec.focused).to.equal(expected.focused);
          });

          it("should have the given description", () => {
            expect(spec.description).to.equal(specDescription);
          });

          it("should have the given test, if any", () => {
            expect(spec.test).to.equal(expected.test);
          });
        });
      });
    },
  );

  describeEach(
    "method signature which appends a suite",
    [
      [
        ".describe(description, closure)",
        desc => subject.describe(desc, noop),
        {
          skipped: false,
          focused: false,
        },
      ],
      [
        ".xdescribe(description, closure)",
        desc => subject.xdescribe(desc, noop),
        {
          skipped: true,
          focused: false,
        },
      ],
      [
        ".fdescribe(description, closure)",
        desc => subject.fdescribe(desc, noop),
        {
          skipped: false,
          focused: true,
        },
      ],
      [
        ".describeEach(description, table, closure)",
        desc => subject.describeEach(desc, [1, 2, 3], noop),
        {
          skipped: false,
          focused: false,
        },
      ],
      [
        ".xdescribeEach(description, table, closure)",
        desc => subject.xdescribeEach(desc, [4, 5, 6], noop),
        {
          skipped: true,
          focused: false,
        },
      ],
      [
        ".fdescribeEach(description, table, closure)",
        desc => subject.fdescribeEach(desc, [9, 8, 7], noop),
        {
          skipped: false,
          focused: true,
        },
      ],
    ],
    ([signature, thunk, expected]) => {
      beforeEach(() => {
        expect(subject.suites).to.have.lengthOf(0);
      });

      const suiteDescription = `test case: ${signature}`;

      describe(signature, () => {
        beforeEach(() => {
          expect(thunk(suiteDescription), "it returns `this`").to.equal(
            subject,
          );
        });

        it("should append a spec", () => {
          expect(subject.suites).to.have.lengthOf(1);
        });

        describe("the appended suite", () => {
          let suite;

          beforeEach(() => {
            [suite] = subject.suites;
          });

          it("should reflect skipped", () => {
            expect(suite.skipped).to.equal(expected.skipped);
          });

          it("should reflect focused", () => {
            expect(suite.focused).to.equal(expected.focused);
          });

          it("should have the given description", () => {
            expect(suite.description).to.equal(suiteDescription);
          });
        });
      });
    },
  );

  const a = noop.bind(null);
  const b = noop.bind(null);

  describeEach(
    "method signatures which append a hook",
    [
      [".beforeAll(hook)", "beforeAll", [a, b]],
      [".afterAll(hook)", "afterAll", [b, a]],
      [".beforeEach(hook)", "beforeEach", [a, b]],
      [".afterEach(hook)", "afterEach", [b, a]],
    ],
    ([signature, hook, expected]) => {
      describe(signature, () => {
        it("should append the hooks in the correct order", () => {
          subject[hook](a);
          subject[hook](b);
          expect(subject.hooks[hook]).to.eql(expected);
        });

        it("should call the hooks when the spec is run", async () => {
          const hookSpy = spy();
          const specSpy = spy();

          subject[hook](hookSpy);
          subject.it("breezes by", specSpy);
          await exhaust(subject.reports());
          expect(hookSpy.calledOnce).to.be.true;
          expect(specSpy.calledOnce).to.be.true;
        });
      });
    },
  );

  it("works for the use-case of attaching global setup/teardown code after the fact", async () => {
    const memo = [];
    const pusher = label =>
      spy(() => {
        memo.push(label);
      });
    const specSpyA = pusher("spec a");
    const specSpyB = pusher("spec b");
    const specSpyC = pusher("spec c");
    const beforeSpy = pusher("before");
    const afterSpy = pusher("after");

    for await (const _ of new Suite(null)
      .it("test a", specSpyA)
      .describe("suite a", s => s.it("test b", specSpyB))
      .describe("suite b", s =>
        s.describe("suite c", s2 => s2.it("test c", specSpyC)),
      )
      .beforeAll(beforeSpy)
      .afterAll(afterSpy)
      .reports());

    expect(beforeSpy.calledOnce).to.be.true;
    expect(specSpyA.calledOnce).to.be.true;
    expect(specSpyB.calledOnce).to.be.true;
    expect(specSpyC.calledOnce).to.be.true;
    expect(afterSpy.calledOnce).to.be.true;
    expect(memo[0]).to.equal("before");
    expect(memo[memo.length - 1]).to.equal("after");
    expect(memo).to.have.lengthOf(5);
  });

  describe(".open()", () => {
    describe("when there are no exceptions", () => {
      let superSpy;

      beforeEach(() => {
        superSpy = spy();

        const spy1 = () => superSpy(1);
        const spy2 = () => superSpy(2);
        const spy3 = () => superSpy(3);

        subject
          .beforeAll(spy1)
          .beforeAll(spy2)
          .beforeAll(spy3);
      });

      it("should return an empty async iterator", async () => {
        for await (const _ of subject.open()) {
          throw new Error("unreachable");
        }
      });

      it("should run all the hooks in FIFO order", async () => {
        await exhaust(subject.open());

        expect(superSpy.getCalls().map(call => call.args)).to.eql([
          [1],
          [2],
          [3],
        ]);
      });
    });

    describe("when opening a suite causes exceptions to be thrown", () => {
      let superSpy;

      beforeEach(() => {
        superSpy = spy();

        const spy1 = () => superSpy(1);
        const spy2 = () => {
          throw new Error("contrived");
        };
        const spy3 = () => superSpy(3);

        subject
          .beforeAll(spy1)
          .beforeAll(spy2)
          .beforeAll(spy3);
      });

      it("should bail midway", async () => {
        await exhaust(subject.open()).catch(reason => {
          expect(reason.message).to.match(/contrived/);
          expect(superSpy.getCalls().map(call => call.args)).to.eql([[1]]);
        });
      });

      describe("attempting to run specs with a bad `beforeAll` hook", () => {
        it("should not run the specs", async () => {
          const specSpy = spy();

          subject.it("a spec", specSpy).it("another spec", specSpy);
          await exhaust(subject.reports());
          expect(specSpy.called).to.be.false;
        });
      });
    });

    it("is idempotent", async () => {
      const spy1 = spy();
      const spy2 = spy();
      const specSpy = spy();

      const subject = new Suite("reopen an open suite")
        .beforeAll(spy1)
        .beforeAll(spy2)
        .it("does nothing", specSpy);

      await exhaust(subject.open());
      await exhaust(subject.open()); // reopening
      await exhaust(subject.open()); // once more for gratuity

      expect(spy1.calledOnce).to.be.true;
      expect(spy2.calledOnce).to.be.true;
      expect(specSpy.called).to.be.false;
    });

    it("recursively calls open on its parents", async () => {
      const outerSpy = spy();
      const middleSpy = spy();
      const innerSpy = spy();
      const subject = new Suite("open a suite")
        .describe("open a child suite", s =>
          s
            .describe("open a grandchild suite", s2 => s2.beforeAll(innerSpy))
            .beforeAll(middleSpy),
        )
        .beforeAll(outerSpy);
      const innerSuite = subject.suites[0].suites[0];

      await exhaust(innerSuite.open());

      expect(outerSpy.calledOnce).to.be.true;
      expect(middleSpy.calledOnce).to.be.true;
      expect(innerSpy.calledOnce).to.be.true;
    }).info("https://github.com/humanchimp/stable/issues/32");
  });

  describe(".close()", () => {
    describe("when the suite is not open", () => {
      it("should not call the `afterAll` hooks", async () => {
        const hookSpy = spy();

        subject.afterAll(hookSpy).afterAll(hookSpy);
        await exhaust(subject.close());
        expect(hookSpy.called).to.be.false;
      });
    });

    describe("when there are no exceptions", () => {
      let superSpy;

      beforeEach(async () => {
        superSpy = spy();

        const spy1 = () => superSpy(1);
        const spy2 = () => superSpy(2);
        const spy3 = () => superSpy(3);

        subject
          .afterAll(spy1)
          .afterAll(spy2)
          .afterAll(spy3);

        await exhaust(subject.open());
      });

      it("should return an empty async iterator", async () => {
        for await (const _ of subject.close()) {
          throw new Error("unreachable");
        }
      });

      it("should run all the hooks in LIFO order", async () => {
        await exhaust(subject.close());

        expect(superSpy.getCalls().map(call => call.args)).to.eql([
          [3],
          [2],
          [1],
        ]);
      });
    });

    describe("when opening a suite causes exceptions to be thrown", () => {
      let superSpy;

      beforeEach(() => {
        superSpy = spy();

        const spy1 = () => superSpy(1);
        const spy2 = () => {
          throw new Error("contrived");
        };
        const spy3 = () => superSpy(3);

        subject
          .beforeAll(spy1)
          .beforeAll(spy2)
          .beforeAll(spy3);
      });

      it("should bail midway", async () => {
        await exhaust(subject.open()).catch(reason => {
          expect(reason.message).to.match(/contrived/);
          expect(superSpy.getCalls().map(call => call.args)).to.eql([[1]]);
        });
      });
    });

    it("is idempotent", async () => {
      const hookSpy = spy();

      subject.afterAll(hookSpy);
      await exhaust(subject.open());
      await exhaust(subject.close());
      await exhaust(subject.close());
      await exhaust(subject.close()); // third time's the charm!

      expect(hookSpy.calledOnce).to.be.true;
    });
  });

  describe(".orderedJobs()", () => {
    it("should return an iterator", () => {
      expect(typeof subject.orderedJobs().next).to.equal("function");
    });

    describeEach(
      "scenario",
      [
        [
          () =>
            subject
              .it("1")
              .it("2")
              .it("3"),
          () => [
            {
              suite: subject,
              spec: subject.specs[0],
              series: 0,
            },
            {
              suite: subject,
              spec: subject.specs[1],
              series: 1,
            },
            {
              suite: subject,
              spec: subject.specs[2],
              series: 2,
            },
          ],
        ],
        [
          () =>
            subject
              .describe("A", s =>
                s
                  .it("1")
                  .it("2")
                  .it("3"),
              )
              .describe("B", s =>
                s
                  .it("4")
                  .it("5")
                  .it("6"),
              )
              .it("7")
              .it("8")
              .it("9"),
          () => [
            {
              suite: subject,
              spec: subject.specs[0],
              series: 0,
            },
            {
              suite: subject,
              spec: subject.specs[1],
              series: 1,
            },
            {
              suite: subject,
              spec: subject.specs[2],
              series: 2,
            },
            {
              suite: subject.suites[0],
              spec: subject.suites[0].specs[0],
              series: 3,
            },
            {
              suite: subject.suites[0],
              spec: subject.suites[0].specs[1],
              series: 4,
            },
            {
              suite: subject.suites[0],
              spec: subject.suites[0].specs[2],
              series: 5,
            },
            {
              suite: subject.suites[1],
              spec: subject.suites[1].specs[0],
              series: 6,
            },
            {
              suite: subject.suites[1],
              spec: subject.suites[1].specs[1],
              series: 7,
            },
            {
              suite: subject.suites[1],
              spec: subject.suites[1].specs[2],
              series: 8,
            },
          ],
        ],
      ],
      ([precondition, expected]) => {
        beforeEach(precondition);

        it("should return the jobs in the expected order", () => {
          const expectedJobs = expected();

          for (const { suite, spec, series } of subject.orderedJobs()) {
            expect(suite).to.equal(expectedJobs[series].suite);
            expect(spec).to.equal(expectedJobs[series].spec);
          }
        });
      },
    );
  });

  describe(".andParents()", () => {
    it("should return an iterator", () => {
      expect(typeof subject.andParents().next).to.equal("function");
    });

    describe("when the suite has no parents", () => {
      it("should yield only itself", () => {
        expect([...subject.andParents()]).to.eql([subject]);
      });
    });

    describe("when the suite has parents", () => {
      let s1: ISuite, s2: ISuite, s3: ISuite;

      beforeEach(() => {
        subject.describe(null, s => (s1 = s));
        s1.describe(null, s => (s2 = s));
        s2.describe(null, s => (s3 = s));
      });

      it("should yield the suite, followed by its parents in ascending order", () => {
        expect([...s3.andParents()]).to.eql([s3, s2, s1, subject]);
      });
    });
  });

  describe(".prefixed(description)", () => {
    describeEach(
      "scenario",
      [
        [new Suite("hi"), "hi milo"],
        [new Suite("good").describe("dog", noop).suites[0], "good dog milo"],
        [
          new Suite("roll")
            .describe("over", noop)
            .suites[0].describe("fetch", noop).suites[0],
          "roll over fetch milo",
        ],
      ],
      ([suite, expected]) => {
        it("should return a prefixed string", () => {
          expect(suite.prefixed("milo")).to.equal(expected);
        });
      },
    );
  });

  describe(".concat(...suites: Suite: []): Suite", () => {
    const a = new Suite(null).it("i").it("ii");
    const b = new Suite(null).it("iii").it("iv");
    const c = new Suite(null).it("v").it("vi");
    let d: Suite;

    beforeEach(() => {
      d = a.concat(b, c);
    });

    it("should return an instance of Suite", () => {
      expect(d).to.be.instanceOf(Suite);
    });

    it("should return a new instance", () => {
      expect(d).not.to.equal(a);
      expect(d).not.to.equal(b);
      expect(d).not.to.equal(c);
    });

    it("should compose the original suite with any suites passed by parameter", async () => {
      expect(await specNamesForSuite(d)).to.eql([
        "i",
        "ii",
        "iii",
        "iv",
        "v",
        "vi",
      ]);
    });

    it("should not mutate the instance suite itself", async () => {
      expect(await specNamesForSuite(a)).to.eql(["i", "ii"]);
    });

    it("should not mutate the suites passed by parameter", async () => {
      expect(await specNamesForSuite(b)).to.eql(["iii", "iv"]);
      expect(await specNamesForSuite(c)).to.eql(["v", "vi"]);
    });
  });

  describe("async iterator methods", () => {
    beforeEach(() => {
      subject
        .it("should work")
        .it("should work async", async () => {})
        .it("should work too")
        .it("gonna fail", () => {
          throw new Error("contrived failure");
        });
    });

    describe(".reports()", () => {
      it("should return an asynchronous iterator over all the reports", async () => {
        const memo = await accumulate(subject.reports());

        expect(memo.length).to.equal(4);
        expect(memo.reduce((m, report) => m + report.ok, 0)).to.equal(3);
      });

      it("should iterate in shuffle order"); // No good way to test this?
    });

    describe(".reports(sorter)", () => {
      it("should return an asynchronous iterator over all the reports", async () => {
        const memo = await accumulate(subject.reports());

        expect(memo.length).to.equal(4);
        expect(memo.reduce((m, report) => m + report.ok, 0)).to.equal(3);
      });

      it("should iterate in sort order", async () => {
        const memo = await accumulate(subject.reports(it => it));

        expect(memo.map(it => it.description)).to.eql([
          "yep fancy description should work",
          "yep fancy description should work async",
          "yep fancy description should work too",
          "yep fancy description gonna fail",
        ]);
      });
    });

    describe(".reports(sorter, predicate)", () => {
      function predicate({ spec: { description } }) {
        return !description.includes("too");
      }

      it("should return an asynchronous iterator over the reports for the jobs matching the predicate", async () => {
        const memo = await accumulate(subject.reports());

        expect(memo.length).to.equal(4);
        expect(memo.reduce((m, report) => m + report.ok, 0)).to.equal(3);
      });

      it("should iterate in sort order", async () => {
        const memo = await accumulate(subject.reports(it => it, predicate));

        expect(memo.map(it => it.description)).to.eql([
          "yep fancy description should work",
          "yep fancy description should work async",
          "yep fancy description gonna fail",
        ]);
      });
    });

    describe(".reports(undefined, predicate)", () => {
      function predicate({ spec: { description } }) {
        return !description.includes("async");
      }

      it("should return an asynchronous iterator over the reports for the jobs matching the predicate", async () => {
        const memo = await accumulate(subject.reports(undefined, predicate));

        expect(memo.length).to.equal(3);
        expect(memo.reduce((m, report) => m + report.ok, 0)).to.equal(2);
      });

      it("should iterate in shuffle order"); // Assume it works?
    });

    describe(".run()", () => {
      it("should return an asynchronous iterator over all the plan, reports and summary", async () => {
        const memo = await accumulate(subject.run());

        expect(memo[0]).to.eql({
          planned: 4,
          total: 4,
        });
        expect(memo[memo.length - 1]).to.eql({
          planned: 4,
          total: 4,
          ok: 3,
          failed: 1,
          skipped: 2,
          completed: 4,
        });
        expect(memo).to.have.lengthOf(6);
      });

      it("should iterate in shuffle order"); // :thinking_face:
    });

    describe(".run(sorter)", () => {
      it("should return an asynchronous iterator over all the plan, reports and summary", async () => {
        const memo = await accumulate(subject.run(it => it));

        expect(memo[0]).to.eql({
          planned: 4,
          total: 4,
        });
        expect(memo[memo.length - 1]).to.eql({
          planned: 4,
          total: 4,
          ok: 3,
          failed: 1,
          skipped: 2,
          completed: 4,
        });
        expect(memo).to.have.lengthOf(6);
      });

      it("should iterate in sort order", async () => {
        const memo = await accumulate(subject.reports(it => it));

        expect(memo.map(it => it.description)).to.eql([
          "yep fancy description should work",
          "yep fancy description should work async",
          "yep fancy description should work too",
          "yep fancy description gonna fail",
        ]);
      });
    });

    describe(".run(sorter, predicate)", () => {
      function predicate({ spec: { description } }) {
        return !description.includes("fail");
      }

      it("should return an asynchronous iterator over all the plan, reports and summary", async () => {
        const memo = await accumulate(subject.run(it => it, predicate));

        expect(memo[0]).to.eql({
          planned: 3,
          total: 4,
        });
        expect(memo[memo.length - 1]).to.eql({
          planned: 3,
          total: 4,
          ok: 3,
          failed: 0,
          skipped: 2,
          completed: 3,
        });
        expect(memo).to.have.lengthOf(5);
      });

      it("should iterate in sort order", async () => {
        const memo = await accumulate(subject.reports(it => it, predicate));

        expect(memo.map(it => it.description)).to.eql([
          "yep fancy description should work",
          "yep fancy description should work async",
          "yep fancy description should work too",
        ]);
      });
    });

    describe(".run(undefined, predicate)", () => {
      function predicate({ spec: { description } }) {
        return description.includes("work");
      }

      it("should return an asynchronous iterator over all the plan, reports and summary", async () => {
        const memo = await accumulate(subject.run(undefined, predicate));

        expect(memo[0]).to.eql({
          planned: 3,
          total: 4,
        });
        expect(memo[memo.length - 1]).to.eql({
          planned: 3,
          total: 4,
          ok: 3,
          failed: 0,
          skipped: 2,
          completed: 3,
        });
        expect(memo).to.have.lengthOf(5);
      });

      it("should iterate in shuffle order"); // I'm not overly worried about testing this
    });
  });

  describeEach(
    "erroneous method signature",
    [
      [".it()", () => subject.it(), /required/],
      [".xit()", () => subject.xit(), /required/],
      [".fit()", () => (subject as any).fit(), /required/],
      [".fit(description)", () => subject.fit("hai"), /required/],
      [".beforeAll()", () => subject.beforeAll(), /required/],
      [".afterAll()", () => subject.afterAll(), /required/],
      [".beforeEach()", () => subject.beforeEach(), /required/],
      [".afterEach()", () => subject.afterEach(), /required/],
      [".describe()", () => (subject as any).describe(), /required/],
      [".describe(description)", () => subject.describe("bonjour"), /required/],
      [".xdescribe()", () => (subject as any).xdescribe(), /required/],
      [".xdescribe(description)", () => subject.describe("hola"), /required/],
      [".fdescribe()", () => (subject as any).fdescribe(), /required/],
      [
        ".fdescribe(description)",
        () => (subject as any).fdescribe("caio"),
        /required/,
      ],
      [".describeEach()", () => (subject as any).describeEach(), /required/],
      [
        ".describeEach(description)",
        () => subject.describe("aloha"),
        /required/,
      ],
      [
        ".describeEach(description, table)",
        () => subject.describeEach("zdravstvuyte", [1, 2, 3]),
        /required/,
      ],
      [".fdescribeEach()", () => (subject as any).fdescribeEach(), /required/],
      [
        ".fdescribeEach(description)",
        () => (subject as any).fdescribe("nǐn hǎo"),
        /required/,
      ],
      [
        ".fdescribeEach(description, table)",
        () => (subject as any).fdescribeEach("konnichiwa", [1, 2, 3]),
        /required/,
      ],
      [".xdescribeEach()", () => (subject as any).xdescribeEach(), /required/],
      [
        ".xdescribeEach(description)",
        () => (subject as any).xdescribe("hallo"),
        /required/,
      ],
      [
        ".xdescribeEach(description, table)",
        () => (subject as any).xdescribeEach("anyoung", [1, 2, 3]),
        /required/,
      ],
    ],
    ([signature, thunk, expectedErrorMessagePattern]) => {
      it(`should throw for the call of signature: ${signature}`, () => {
        expect(thunk).to.throw(expectedErrorMessagePattern);
      });
    },
  );
});

describe("new Suite(description, { listeners })", () => {
  describe('when a "pending" listener was passed', () => {
    it("should schedule the listener to run before running each test", async () => {
      const pendingSpy = spy();
      const spec1Spy = spy(() => {
        expect(pendingSpy.calledOnce).to.be.true;
      });
      const spec2Spy = spy(() => {
        expect(pendingSpy.calledTwice).to.be.true;
      });

      const subject: Suite = new Suite("pending fires each time", {
        listeners: {
          pending: [pendingSpy],
        },
      })
        .it("test 1", spec1Spy)
        .it("test 2", spec2Spy);

      await exhaust(subject.reports());

      expect(pendingSpy.calledTwice).to.be.true;
      expect(spec1Spy.calledOnce).to.be.true;
      expect(spec2Spy.calledOnce).to.be.true;
    });

    it("should be capable of skipping a test from the listener", async () => {
      const pendingSpy = spy((_, skip) => {
        skip();
      });
      const specSpy = spy();

      const subject: Suite = new Suite(
        "pending listener is capable of skipping the test",
        {
          listeners: {
            pending: [pendingSpy],
          },
        },
      ).it("should be skipped", specSpy);

      await exhaust(subject.reports());

      expect(pendingSpy.calledOnce).to.be.true;
      expect(specSpy.called).to.be.false;
    });

    it("will be called for neither skipped specs nor stubs", async () => {
      const pendingSpy = spy();
      const specSpy = spy();

      const subject: Suite = new Suite(
        "pending listener is capable of skipping the test",
        {
          listeners: {
            pending: [pendingSpy],
          },
        },
      )
        .xit("would pass but is skipped", specSpy)
        .it("is a mere stub");

      await exhaust(subject.reports());

      expect(pendingSpy.called).to.be.false;
      expect(specSpy.called).to.be.false;
    });

    it("is possible to set the report ok in advance", async () => {
      const pendingSpy = spy((report, skip) => {
        report.ok = false;
        report.reason = new Error("it's embarrassing! i'll tell you later");
        skip();
      });
      const specSpy = spy(() => {
        expect(pendingSpy.calledOnce).to.be.true;
      });

      const subject: Suite = new Suite(
        "pending listener is capable of skipping the test",
        {
          listeners: {
            pending: [pendingSpy],
          },
        },
      )
        .it("runs... oh, does it run... yes! yes! IT'S ALIVE!!!", specSpy)
        .it("is a mere stub");

      await exhaust(subject.reports());

      expect(pendingSpy.called).to.be.true;
      expect(specSpy.called).to.be.false;
    });
  });

  describe('when multiple "pending" listeners are passed', () => {
    it("should call them in order", async () => {
      const pendingSpy1 = spy(() => {
        expect(pendingSpy2.called).to.be.false;
      });
      const pendingSpy2 = spy(() => {
        expect(pendingSpy1.calledOnce).to.be.true;
      });

      const specSpy = spy();

      const subject: Suite = new Suite(
        "pending listener is capable of skipping the test",
        {
          listeners: {
            pending: [pendingSpy1, pendingSpy2],
          },
        },
      ).it("should be skipped", specSpy);

      await exhaust(subject.reports());

      expect(pendingSpy1.calledOnce).to.be.true;
      expect(pendingSpy2.calledOnce).to.be.true;
      expect(specSpy.calledOnce).to.be.true;
    });
  });

  describe('when a "completed" listener was passed', () => {
    it("should schedule the listener to run after running each test", async () => {
      const completeSpy = spy();
      const spec1Spy = spy(() => {
        expect(completeSpy.called).to.be.false;
      });
      const spec2Spy = spy(() => {
        expect(completeSpy.called).to.be.false;
      });

      const subject: Suite = new Suite("pending fires each time", {
        listeners: {
          complete: [completeSpy],
        },
      })
        .it("test 1", spec1Spy)
        .it("test 2", spec2Spy);

      await exhaust(subject.reports());

      expect(completeSpy.calledTwice).to.be.true;
      expect(spec1Spy.calledOnce).to.be.true;
      expect(spec2Spy.calledOnce).to.be.true;
    });

    it("should be capable of failing an otherwise passing test from the listener", async () => {
      const completeSpy = spy((_, fail) => {
        fail();
      });
      const specSpy = spy();

      const subject: Suite = new Suite(
        "pending listener is capable of skipping the test",
        {
          listeners: {
            complete: [completeSpy],
          },
        },
      ).it("passes with flying colors", specSpy);

      for await (const report of subject.reports()) {
        expect(report.ok).to.be.false; // B-but!
      }

      expect(completeSpy.calledOnce).to.be.true;
      expect(specSpy.called).to.be.true;
    });

    it("should do nothing when attempting to fail a failed test", async () => {
      const completeSpy = spy((_, fail) => {
        fail();
      });
      const specSpy = spy(() => {
        expect("eleventynine").to.be.instanceOf(Number);
      });

      const subject: Suite = new Suite(
        "pending listener is capable of skipping the test",
        {
          listeners: {
            complete: [completeSpy],
          },
        },
      ).it("doesn't like that", specSpy);

      for await (const report of subject.reports()) {
        expect(report.ok).to.be.false; // B-but!
      }

      expect(completeSpy.calledOnce).to.be.true;
      expect(specSpy.called).to.be.true;
    });

    it("should be capable of passing an otherwise failing test from the listener (by setting ok)", async () => {
      const completeSpy = spy(report => {
        report.ok = true;
        report.orAnythingElseForThatMatter = true;
      });
      const specSpy = spy(() => {
        expect("up").to.equal("down");
      });

      const subject: Suite = new Suite(
        "pending listener is capable of skipping the test",
        {
          listeners: {
            complete: [completeSpy],
          },
        },
      ).it("fails woefully", specSpy);

      for await (const report of subject.reports()) {
        expect(report.ok).to.be.true;
        expect(report.orAnythingElseForThatMatter).to.be.true;
      }

      expect(completeSpy.calledOnce).to.be.true;
      expect(specSpy.called).to.be.true;
    });

    it("will be called for neither skipped specs nor stubs", async () => {
      const completeSpy = spy(report => {
        report.ok = true;
        report.orAnythingElseForThatMatter = true;
      });
      const specSpy = spy();

      const subject: Suite = new Suite(
        "pending listener is capable of skipping the test",
        {
          listeners: {
            complete: [completeSpy],
          },
        },
      )
        .xit("would pass but is skipped", specSpy)
        .it("is a mere stub");

      await exhaust(subject.reports());

      expect(completeSpy.called).to.be.false;
      expect(specSpy.called).to.be.false;
    });
  });

  describe('when multiple "complete" listeners are passed', () => {
    it("should call them in order", async () => {
      const spy1 = spy(() => {
        expect(spy2.called).to.be.false;
      });
      const spy2 = spy(() => {
        expect(spy1.called).to.be.true;
      });
      const specSpy = spy(() => {
        expect(spy1.called).to.be.false;
        expect(spy2.called).to.be.false;
      });
      const subject: Suite = new Suite("multiple complete listeners", {
        listeners: {
          complete: [spy1, spy2],
        },
      }).it("passes elegantly", specSpy);

      await exhaust(subject.reports());

      expect(spy1.calledOnce).to.be.true;
      expect(spy2.calledOnce).to.be.true;
      expect(specSpy.called).to.be.true;
    });
  });

  describe('when both "pending" and "completed" listeners are passed', () => {
    it("should call them both", async () => {
      const pendingSpy = spy();
      const completeSpy = spy();
      const specSpy = spy();

      const subject: Suite = new Suite("typical plugin", {
        listeners: {
          pending: [pendingSpy],
          complete: [completeSpy],
        },
      }).it("should run", specSpy);

      await exhaust(subject.reports());

      expect(pendingSpy.calledOnce).to.be.true;
      expect(completeSpy.calledOnce).to.be.true;
      expect(specSpy.calledOnce).to.be.true;
    });
  });
});

describe("new Suite()", () => {
  it("should throw an error", () => {
    expect(() => {
      new Suite();
    }).to.throw(/required/);
  });
});

describe("new Suite(null)", () => {
  it("should work ok", () => {
    expect(new Suite(null).description).to.be.null;
  });
});

describe('the correct "this" bindings', () => {
  it('should call the specs with the spec as "this"', async () => {
    let that;
    const suite = new Suite(null).it(
      "should work with old function expressions and such",
      function() {
        that = this;
      },
    );

    await exhaust(suite.run());
    expect(that).to.equal(suite.specs[0]);
  });

  it('should call "xEach" hooks with the spec as "this"', async () => {
    let thatBefore, thatAfter;
    const suite = new Suite(null)
      .beforeEach(function() {
        thatBefore = this;
      })
      .afterEach(function() {
        thatAfter = this;
      })
      .it("passes", () => {});

    await exhaust(suite.run());
    expect(thatBefore)
      .to.equal(thatAfter)
      .and.equal(suite.specs[0]);
  });

  it('should call "xAll" hooks with the suite as "this"', async () => {
    let thatBefore, thatAfter;
    const suite = new Suite(null)
      .beforeAll(function() {
        thatBefore = this;
      })
      .afterAll(function() {
        thatAfter = this;
      })
      .it("passes", () => {});

    await exhaust(suite.run());
    expect(thatBefore)
      .to.equal(thatAfter)
      .and.equal(suite);
  });

  describe("new Suite().info(info: any)", () => {
    it("should accumulate objects in the `metas` property", () => {
      const subject = new Suite(null);
      const a = {},
        b = {},
        c = {};

      expect(
        subject
          .info(a)
          .info(b)
          .info(c).meta.infos,
      ).to.eql([a, b, c]);
    });
  });
}).info("https://github.com/humanchimp/stable/issues/60");

function noop() {}
