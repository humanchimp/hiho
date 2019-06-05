import { shuffleRng } from "./shuffleRng";
import { Sorter } from "./interfaces";

interface Shuffle extends Sorter {
  rng: (rng: () => number) => Sorter;
}

const shuffle: Shuffle = shuffleRng(Math.random) as Shuffle;

shuffle.rng = shuffleRng;

export { shuffle };
