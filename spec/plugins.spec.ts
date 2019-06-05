import { expect } from "chai";
import { plugins } from "../src/plugins";
import { Listeners } from "../src/Listeners";

function a() {}
function b() {}
function c() {}
function d() {}

let subject;

beforeEach(() => {
  subject = plugins([
    { pending: a, complete: b },
    { complete: c },
    { pending: d },
  ]);
});

it("should reduce the listeners from all plugins into a single representation", () => {
  expect(subject).to.eql({
    listeners: {
      pending: [a, d],
      complete: [b, c],
    },
  });
});

describe(".listeners", () => {
  it("should be an instance of Listeners", () => {
    expect(subject.listeners).to.be.instanceOf(Listeners);
  });
});
