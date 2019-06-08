import { expect } from "chai";
import { describe as createSuite } from "../src/describe";
import { reports } from "../src/reports";

describe("the reports helper", () => {
  it("should return an asynchronous iterator over the suite reports", async () => {
    for await (const report of reports([
      createSuite("first suite").it("should run").parent,
      createSuite("second suite").it("should run").parent,
    ])) {
      expect(report.description).to.match(/should run/);
      expect(report.skipped).to.be.true;
      expect(report.ok).to.be.true;
    }
  });

  it("should splat and run a single suite", async () => {
    for await (const report of reports(
      createSuite("first suite").it("should run").parent,
    )) {
      expect(report.description).to.match(/should run/);
      expect(report.skipped).to.be.true;
      expect(report.ok).to.be.true;
    }
  });

  it("should be possible to specify the sort", async () => {
    const memo = [];

    for await (const report of reports(
      [
        createSuite(null)
          .it("l")
          .parent.it("m")
          .parent.it("n")
          .parent.it("o")
          .parent.it("p").parent,
        createSuite(null)
          .it("z")
          .parent.it("y")
          .parent.it("x")
          .parent.it("w")
          .parent.it("v").parent,
        createSuite(null)
          .it("a")
          .parent.it("b")
          .parent.it("c")
          .parent.it("d")
          .parent.it("e").parent,
      ],
      array =>
        array.sort((a, b) =>
          a.spec.description.localeCompare(b.spec.description),
        ),
    )) {
      memo.push(report.description);
    }
    expect(memo).to.eql([
      "a",
      "b",
      "c",
      "d",
      "e",
      "l",
      "m",
      "n",
      "o",
      "p",
      "v",
      "w",
      "x",
      "y",
      "z",
    ]);
  });
});
