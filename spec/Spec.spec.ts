import { expect } from "chai";
import { spy } from "sinon";
import { Spec } from "../src/Spec";
import { ISuite } from "../src/interfaces";

describe("new Spec() properties of new instances", () => {
  let spec;

  beforeEach(() => {
    spec = new Spec({
      description: "boring",
      test() {},
    });
  });

  it("meta should be blank by default", () => {
    expect(spec.meta).to.eql({});
  });

  describe(".timeout(number)", () => {
    it("should annotate meta.timeout", () => {
      spec.timeout(8000);
      expect(spec.meta).to.eql({ timeout: 8000 });
    });
  });

  describe(".info(infos)", () => {
    it("should accumulate meta.infos", () => {
      expect(spec.meta).to.eql({});
      spec.info("lala");
      expect(spec.meta).to.eql({ infos: ["lala"] });
      spec.info("baba");
      expect(spec.meta).to.eql({ infos: ["lala", "baba"] });
      spec.info("caca");
      expect(spec.meta).to.eql({ infos: ["lala", "baba", "caca"] });
    });
  });
});

describe(".run()", () => {
  it("is a covenience method which delegates to the .runSpec(spec) method of its parent passing itself as the only argument", async () => {
    const runSpecSpy = spy();
    const subject = new Spec({
      description: "test",
      parent: ({ runSpec: runSpecSpy } as any) as ISuite,
    });

    await subject.run();
    expect(runSpecSpy.calledOnce).to.be.true;
    expect(runSpecSpy.calledWithExactly(subject)).to.be.true;
  });
});
