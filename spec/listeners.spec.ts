import { ISuite } from "../src/interfaces";
import { expect } from "chai";
import { spy } from "sinon";
import { run } from "../src/run";
import { dsl } from "../src/dsl";
import { reports } from "../src/reports";

const code = `
describe("outer 1", () => {
  describe("inner 1", () => {
    it("spec 1", spy);

    it("spec 2", spy);
  });

  describe("inner 2", () => {
    it("spec 2", spy);

    it("spec 4", spy);
  });
});

describe("outer 2", () => {
  describe("inner 3", () => {
    it("spec 5", spy);
  });
});`;

let specSpy;
let logSpy;

beforeEach(() => {
  specSpy = spy();
  logSpy = spy(report => {
    expect(report.ok).to.be.true;
  });
});

describe("pending listener", () => {
  it("should fire before each spec", async () => {
    const pendingSpy = spy(report => {
      expect(report.description)
        .to.contain("outer")
        .and.contain("inner");
      expect(report.ok).to.equal(undefined);
    });

    await runWithListeners({ pending: pendingSpy });
    expect(pendingSpy.callCount).to.equal(5);
    expect(specSpy.callCount).to.equal(5);
    expect(logSpy.callCount).to.equal(5);
  });

  describe("skipping a test case from the listener", () => {
    let pendingSpy;

    it("should be ok by default", () => {
      pendingSpy = spy((_, skip) => {
        skip();
      });
    });

    it("should be possible to explictly set ok", () => {
      pendingSpy = spy((report, skip) => {
        report.ok = false;
        report.reason = new Error("it's embarrassing! i'll tell you later");
        skip();
      });

      logSpy = spy(report => {
        expect(report.ok).to.be.false;
        expect(report.reason.message).to.match(/embarrassing/);
      });
    });

    afterEach(async () => {
      await runWithListeners({
        pending: pendingSpy,
      });
      expect(pendingSpy.callCount).to.equal(5);
      expect(specSpy.callCount).to.equal(0);
      expect(logSpy.callCount).to.equal(5);
    });
  });
});

describe("complete listener", () => {
  it("should fire after each spec", async () => {
    const completeSpy = spy(report => {
      expect(report.ok).to.be.true;
    });

    await runWithListeners({ complete: completeSpy });
    expect(specSpy.callCount).to.equal(5);
    expect(completeSpy.callCount).to.equal(5);
    expect(logSpy.callCount).to.equal(5);
  });

  it("should be possible to fail the test from the listener", async () => {
    const completeSpy = spy((report, fail) => {
      expect(report.ok).to.be.true;
      fail();
    });

    logSpy = spy(report => {
      expect(report.ok).to.be.false;
    });
    await runWithListeners({ complete: completeSpy });
  });

  it("should be possible to fail a test from the listener, even if it already failed", async () => {
    const completeSpy = spy((report, fail) => {
      expect(report.ok).to.be.false;
      expect(report.reason.message).to.match(/contrived/);
      fail();
    });

    logSpy = spy(report => {
      expect(report.ok).to.be.false;
    });
    await runWithListeners({ complete: completeSpy }, contrivedFailure);
  });

  it('should be possible to "rescue" a failed test from the listener', async () => {
    const completeSpy = spy(report => {
      expect(report.ok).to.be.false;
      expect(report.reason.message).to.match(/contrived/);
      report.ok = true; // "rescuing"
    });

    await runWithListeners({ complete: completeSpy }, contrivedFailure);
  });
});

async function runWithListeners(listeners, spy = specSpy) {
  const suite: ISuite = await dsl({
    ...{
      code,
      listeners,
      helpers: { spy },
    },
  });

  await run(suite as any, { generate: reports, perform: logSpy });
}

function contrivedFailure() {
  throw new Error("contrived");
}
