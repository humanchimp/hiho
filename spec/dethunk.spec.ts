import { expect } from "chai";
import { spy as createSpy } from "sinon";
import { Suite } from "../src/Suite";
import { dethunk } from "../src/dethunk";
import { accumulate } from "./util/accumulate";

describe("the dethunk helper", () => {
  it("should call the thunk, injecting all the framework blocks", async () => {
    const spy = createSpy();

    dethunk(spy);
    expect(spy.calledOnce).to.be.true;
    expect(spy.getCall(0).args).to.have.lengthOf(14);
  });

  it("should return a promise of a suite", async () => {
    const promise = dethunk(() => {});

    expect(Promise.resolve(promise)).to.equal(promise);
    expect(await promise).to.be.instanceOf(Suite);
  });

  describeEach(
    "some dsl combinations",
    [
      [
        (
          _describe,
          _xdescribe,
          _fdescribe,
          _describeEach,
          _xdescribeEach,
          _fdescribeEach,
          _it,
        ) => {
          _describe("a suite", () => {
            _describe("a nested suite", () => {
              _it("should run too", () => {});

              _it("should also run", () => {});
            });

            _it("should run", () => {});

            _it("should run three", () => {});
          });
        },
        [
          { description: "a suite should run", ok: true },
          { description: "a suite should run three", ok: true },
          { description: "a suite a nested suite should run too", ok: true },
          { description: "a suite a nested suite should also run", ok: true },
        ],
      ],
      [
        (
          _describe,
          _xdescribe,
          _fdescribe,
          _describeEach,
          _xdescribeEach,
          _fdescribeEach,
          _it,
        ) => {
          const rows = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
          let count = 0;

          _describeEach("a table", rows, row => {
            _it("should iterate the rows", () => {
              expect(row).to.eql(rows[count++]);
            });
          });
        },
        [
          {
            description: "a table a table [table] should iterate the rows",
            ok: true,
          },
          {
            description: "a table a table [table] should iterate the rows",
            ok: true,
          },
          {
            description: "a table a table [table] should iterate the rows",
            ok: true,
          },
        ],
      ],
      [
        (
          _describe,
          _xdescribe,
          _fdescribe,
          _describeEach,
          _xdescribeEach,
          _fdescribeEach,
          _it,
          _xit,
          _fit,
          _beforeEach,
        ) => {
          _beforeEach(() => {
            expect(true).to.be.false;
          });
        },
        [],
      ],
      [
        (
          _describe,
          _xdescribe,
          _fdescribe,
          _describeEach,
          _xdescribeEach,
          _fdescribeEach,
          _it,
          _xit,
          _fit,
          _beforeAll,
        ) => {
          const hookSpy = createSpy();

          _beforeAll(hookSpy);

          _it("should run the `beforeAll` hook", () => {
            expect(hookSpy.calledOnce).to.be.true;
          });
        },
        [
          {
            description: "should run the `beforeAll` hook",
            ok: true,
          },
        ],
      ],
      [
        (
          _describe,
          _xdescribe,
          _fdescribe,
          _describeEach,
          _xdescribeEach,
          _fdescribeEach,
          _it,
          _xit,
          _fit,
          _beforeAll,
          _afterAll,
          _beforeEach,
          _afterEach,
          _info,
        ) => {
          _info("an info annotation");
        },
        [{ description: "an info annotation", ok: true, skipped: true }],
      ],
    ],
    ([thunk, reports]) => {
      it("should dethunk the thunk expectedly", async () => {
        expect(
          await accumulate((await dethunk(thunk)).reports(it => it)),
        ).to.eql(reports);
      });
    },
  );
});
