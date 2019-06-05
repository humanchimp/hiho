import { listenersForPlugins } from "./listenersForPlugins";

export function plugins(pluginsHash) {
  return {
    listeners: listenersForPlugins(Object.values(pluginsHash)),
  };
}
