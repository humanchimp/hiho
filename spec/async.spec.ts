import { expect } from "chai";

it("should handle async functions", async () => {
  await delay(10);
  expect(true).to.equal(true);
});

xit("should be possible to set a timeout for an individual spec", async () => {
  // TODO: since I am removing rescue (and plugins) this will need to be tested
  //   another way.
  await delay(600);
});

it("should be possible to pass a done callback-receiving test case", done => {
  setTimeout(done, 10);
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
