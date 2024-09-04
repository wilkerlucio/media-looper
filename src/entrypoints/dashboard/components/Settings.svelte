<script lang="ts">

  import {getTinyContextForce, useValue} from "@/lib/tinybase/tinybase-stores";
  import {A, Input, Label, Spinner} from "flowbite-svelte";

  const wsConfig = useValue('websocket-server-url', '', getTinyContextForce('localStore'))
  const wsStatus = useValue('websocket-server-status', '', getTinyContextForce('localStore'))

  const statusColors = {
    'connected': 'green',
    'error': 'red'
  }

  // @ts-ignore
  $: wsColor = statusColors[$wsStatus] || 'base'

</script>

<div class="mb-6">
  <Label for="ws-server-url" color={wsColor} class="mb-2">
    Web Socket Server URL (<A href="https://github.com/wilkerlucio/media-looper?tab=readme-ov-file#running-a-sync-server" target="_blank">how to setup a sync server</A>)
  </Label>
  <Input
      type="text"
      id="ws-server-url"
      color={wsColor}
      placeholder="ws://localhost:8047/youtube-looper"
      bind:value={$wsConfig}
  >
    <div slot="right">
      {#if $wsStatus === 'connecting'}
        <Spinner size={4} class="ml-2" />
      {/if}
    </div>
  </Input>
</div>
