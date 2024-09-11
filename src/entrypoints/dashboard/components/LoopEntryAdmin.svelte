<script lang="ts">
  import {getTinyContextForce, useRow} from "@/lib/tinybase/tinybase-stores.svelte";
  import {formatTime} from "@/lib/helpers/time";

  export let id: string;

  const store = getTinyContextForce('store')

  const loop = useRow(store, 'loops', id)
</script>

<div>
  <span contenteditable bind:innerHTML={$loop.label}></span> |

  {formatTime($loop.startTime)} - {formatTime($loop.endTime)}
</div>
