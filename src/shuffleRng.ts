// The Fisher-Yates shuffle.
// Lovingly forked from a nice blog post by Mike Bostock.
// Recommended reading: https://bost.ocks.org/mike/shuffle/

function shuffleRng(rng) {
  return function shuffle(array) {
    let w = array.length;

    // While there remain elements to shuffle…
    while (w) {
      // Pick a remaining element…
      const o = Math.floor(rng() * w--);

      // And swap it with the current element.
      [array[w], array[o]] = [array[o], array[w]];
    }
    return array;
  };
}

export { shuffleRng };
