<script>

  import {getTinyContextForce, useValue} from "@/lib/tinybase/tinybase-stores";

  const connectionStatus = useValue('websocket-server-status', '', getTinyContextForce('localStore'))

</script>

{#if $connectionStatus === "connected"}
  <div class="sync-connected" title="Sync connected"></div>
{/if}
{#if $connectionStatus === "error"}
  <div class="sync-error" title="Sync isn't working. Check it at the dashboard settings."></div>
{/if}

<style>

    .sync-connected {
        background: green;
        width: 8px;
        height: 8px;
        border-radius: 100%;
    }

    .sync-error {
        background: red;
        width: 8px;
        height: 8px;
        border-radius: 100%;
    }

</style>
