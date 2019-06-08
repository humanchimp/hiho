import { expect } from "chai";
import { spy as createSpy } from "sinon";
import { accumulate } from "./util/accumulate";
import { describe as createSuite } from "../src/describe";
import { ISuite } from "../src";

let subject: ISuite;

describe("group", () => {
  describe("instance methods", () => {
    beforeEach(() => {
      subject = createSuite("subject");
    });

    it("should have an `it` method", () => {
      expect(typeof subject.it).to.equal("function");
    });

    it("should have a `reports` method", () => {
      expect(typeof subject.reports).to.equal("function");
    });

    describe("Suite#it", () => {
      it("should enqueue a spec", () => {
        expect(subject.specs).to.have.lengthOf(0);
        subject.it("it", () => {});
        expect(subject.specs).to.have.lengthOf(1);
      });
    });

    describe("Suite#reports", () => {
      beforeEach(() => {
        subject.it("a", () => {}).parent.it("b", () => {});
      });

      it("asynchronously yields reports", async () => {
        expect(await accumulate(subject.reports(it => it))).to.eql([
          { description: "subject a", ok: true },
          { description: "subject b", ok: true },
        ]);
      });

      it("should shuffle the specs by default", async () => {
        const reports = await accumulate(subject.reports());

        expect(reports).to.have.lengthOf(2);
      });
    });

    describe("Suite#xdescribe", () => {
      beforeEach(() => {
        subject.xdescribe(
          "xdescribe",
          s1 =>
            s1
              .it("should pass", () => {})
              .parent.it("should fail", () => {
                expect(true).to.be.false;
              })
              .parent.describe(
                "inner suite",
                s2 =>
                  s2
                    .it("should pass", () => {})
                    .parent.it("should fail", () => {
                      expect(true).to.be.false;
                    })
                    .parent.xit("would pass")
                    .parent.xit("would fail").parent,
              ).parent,
        );
      });

      it("should skip all the specs all the way down, turtle-wise", async () => {
        expect(await accumulate(subject.reports(it => it))).to.eql([
          {
            description: "subject xdescribe should pass",
            ok: true,
            skipped: true,
          },
          {
            description: "subject xdescribe should fail",
            ok: true,
            skipped: true,
          },
          {
            description: "subject xdescribe inner suite should pass",
            ok: true,
            skipped: true,
          },
          {
            description: "subject xdescribe inner suite should fail",
            ok: true,
            skipped: true,
          },
          {
            description: "subject xdescribe inner suite would pass",
            ok: true,
            skipped: true,
          },
          {
            description: "subject xdescribe inner suite would fail",
            ok: true,
            skipped: true,
          },
        ]);
      });
    });
  });

  describe("the imperative suite factory", () => {
    let spy;

    describe("when a closure is passed", () => {
      beforeEach(() => {
        spy = createSpy();
        subject = createSuite("test", spy);
      });

      it("should execute the closure immediately", () => {
        expect(spy.calledOnce).to.be.true;
      });
    });
  });
});
