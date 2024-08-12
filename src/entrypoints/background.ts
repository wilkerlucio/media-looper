import {setupRepo, setupStore} from "@/lib/stores/core";
import {backgroundListen} from "@/lib/misc/chrome-network";

export default defineBackground({
  persistent: true,

  main() {
    const backConn = backgroundListen()
    const ctx = setupStore({persist: true, backConn})

    globalThis.store = ctx.store
  }
});
