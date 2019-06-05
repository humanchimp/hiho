import { Listener } from "./interfaces";
import { Listeners } from "./Listeners";

interface Plugin {
  complete?: Listener;
  pending?: Listener;
  config?: any;
}

export function listenersForPlugins(plugins: Plugin[]): Listeners {
  return new Listeners(
    plugins.reduce(
      (memo, { pending = [], complete = [], config = {} }) => ({
        pending: memo.pending.concat(pending),
        complete: memo.complete.concat(complete),
        config: config,
      }),
      { pending: [], complete: [], config: {} },
    ),
  );
}
