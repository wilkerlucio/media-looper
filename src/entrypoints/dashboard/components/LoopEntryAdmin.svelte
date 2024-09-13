<script lang="ts">
  import {getTinyContextForce, useRow} from "@/lib/tinybase/tinybase-stores.svelte";
  import {formatTime} from "@/lib/helpers/time";
  import type {Loop} from "@/lib/model";

  export let id: string;

  const store = getTinyContextForce('store')

  const loop = useRow<Loop>(store, 'loops', id)
</script>

<div>
  <span contenteditable bind:innerHTML={$loop.label}></span> |

  {formatTime($loop.startTime)} - {formatTime($loop.endTime)}
</div>
