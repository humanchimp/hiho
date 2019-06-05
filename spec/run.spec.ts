import { expect } from "chai";
import { spy as createSpy, SinonSpy } from "sinon";
import { describe as createSuite } from "../src/describe";
import { run, generator } from "../src/run";

async function* generate(_, sort) {
  const result = [1, 2, 3];

  sort(result);
  yield* result;
}

describe("run", () => {
  describe("when an array of suites is passed", () => {
    let suites;

    beforeEach(() => {
      suites = [
        createSuite(null).it("should run"),
        createSuite(null).it("should run 2"),
        createSuite(null).it("should run 3"),
      ];
    });

    it("should by default perform console.log", async () => {
      /* eslint-disable no-console */
      createSpy(console, "log");
      await run(suites, { generate });
      expect((console.log as SinonSpy).callCount).to.equal(3);
      (console.log as SinonSpy).restore();
      /* eslint-enable no-console */
    });

    describe("passing an arbitrary effect", () => {
      let memo, perform;

      beforeEach(() => {
        memo = [];

        perform = report => {
          memo.push(report);
        };
      });

      it("should be possible to perform an aribtrary effect", async () => {
        await run(suites, { generate, perform });
        expect(memo.sort((a, b) => a - b)).to.eql([1, 2, 3]);
      });

      it("should be possible to pass a sort algorithm", async () => {
        const sort = array => array.sort((a, b) => b - a);

        await run(suites, { generate, perform, sort });
        expect(memo).to.eql([3, 2, 1]);
      });
    });

    describe("when called without options", () => {
      it("should default using to the reports generator");

      it("should by default perform console.log");
    });
  });

  describe("when a single suite is passed", () => {
    let suite;

    beforeEach(() => {
      suite = createSuite(null)
        .it("should run")
        .it("should also run")
        .it("should run three");
    });

    it("should pull the specs out of the default generator", async () => {
      const spy = createSpy();

      await run(suite, { perform: spy });
      expect(spy.callCount).to.equal(5);
    });

    describe("when called without options", () => {
      it("should default using to the reports generator", async () => {
        // const spy = createSpy();

        await run(suite);

        // TODO: complete writing this test case?
      });

      it("should by default perform console.log", async () => {
        /* eslint-disable no-console */
        createSpy(console, "log");
        await run(suite);
        expect((console.log as SinonSpy).callCount).to.equal(5);
        (console.log as SinonSpy).restore();
        /* eslint-enable no-console */
      });

      info(
        "it would be nice to have a story for testing sort is shuffle by default :thinking_face:",
      );
    });
  });
});

describe("generator", () => {
  let suite, spy;

  beforeEach(() => {
    spy = createSpy();
    suite = createSuite(null)
      .it("should run", spy)
      .it("stub")
      .xit("skipped");
  });

  describe("generator(suite: Suite)", () => {
    it("should return an async iterator over the reports in shuffled order", async () => {
      for await (const report of generator(suite)) {
        if ("ok" in report && !("completed" in report)) {
          expect(report.ok).to.be.true;
        }
      }
    });
  });

  describe("generator(suites: Suite[])", () => {
    it("should return an async iterator over the reports in shuffled order");
  });

  describe("generator(suite: Suite, sort: Sorter)", () => {
    it("should return an async iterator over the reports in sorted order");
  });

  describe("generator(suites: Suite[], sort: Sorter)", () => {
    it("should return an async iterator over the reports in sorted order");
  });

  describe("generator(suite: Suite, sort: Sorter, predicate: JobPredicate)", () => {
    it(
      "should return an async iterator over the filtered reports in sorted order",
    );
  });

  describe("generator(suites: Suite[], sort: Sorter, predicate: JobPredicate)", () => {
    it(
      "should return an async iterator over the filtered reports in sorted order",
    );
  });
});
