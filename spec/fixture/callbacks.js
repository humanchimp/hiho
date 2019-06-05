describe("test", () => {
  it("passes asynchronously", done => {
    setTimeout(done, 10);
  });

  it("passes synchronously", done => {
    done();
  });

  it("fails asynchronously", done => {
    setTimeout(() => done(new Error("contrived")), 10);
  });

  it("fails synchronously", done => {
    done(new Error("contrived 2"));
  });
});
