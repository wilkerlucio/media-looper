<script lang="ts">

  import {useValue} from "@/lib/tinybase/tinybase-stores";
  import {Input, Label, Spinner} from "flowbite-svelte";

  const wsConfig = useValue('websocket-server-url')
  const wsStatus = useValue('websocket-server-status')

  const statusColors = {
    'connected': 'green',
    'error': 'red'
  }

  // @ts-ignore
  $: wsColor = statusColors[$wsStatus] || 'base'

</script>

<div class="mb-6">
  <Label for="ws-server-url" color={wsColor} class="mb-2">
    Web Socket Server URL
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
