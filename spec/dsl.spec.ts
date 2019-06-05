import { expect } from "chai";
import * as sinon from "sinon";
import { accumulate } from "./util/accumulate";
import { getFixtures } from "./util/getFixtures";
import { dsl } from "../src/dsl";

info("https://github.com/humanchimp/stable/issues/1");

describe("fixtures", () => {
  const fixtures = getFixtures();

  describeEach(
    "expected reports generated from applications of the DSL",
    fixtures,
    ({ fixture, code, data: expectedReports }) => {
      it(`should return an asynchronous iterator over the sequential ${fixture} reports`, async () => {
        const suite = await dsl({ code, helpers: { expect, sinon } });
        const reports = await accumulate(suite.reports(it => it));

        scrubReasons(reports);
        expect(reports).to.eql(expectedReports);
      });
    },
  );
});

describeEach(
  "cases that should not work",
  [
    [`fit("focusing a stub")`, /required/],
    [`fdescribe("suites aren't stubs")`, /required/],
    [`describeEach("describe each requires a table")`, /required/],
    // [`describe.each("describeEach requires a closure", [])`, /required/],
  ],
  ([code, pattern]) => {
    it("should throw an error", async () => {
      await dsl({ code }).catch(reason => {
        expect(reason.message).to.match(pattern);
      });
    });
  },
);

function scrubReasons(reports) {
  for (const report of reports) {
    if (report.reason != null) {
      report.reason = { message: report.reason.message };
    }
  }
}
