export function wrapTestCase(test) {
  if (test == null || test.length === 0) {
    return test;
  }
  if (test.length === 1) {
    return () =>
      new Promise((resolve, reject) => {
        test((reason: any) => {
          if (reason != null) {
            reject(reason);
          } else {
            resolve();
          }
        });
      });
  }
  throw new Error(
    'too many arguments: a test case callback can receive, at most, a single argument, a "done" callback to signal asynchronous completion.',
  );
}
