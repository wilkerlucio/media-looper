<script lang="ts">
  import {getTinyContextForce, useRow} from "@/lib/tinybase/tinybase-stores";
  import {formatTime} from "@/lib/helpers/time";
  import type {Loop} from "@/lib/model";

  let {id}: {id: string} = $props()

  const store = getTinyContextForce('store')

  const loop = useRow<Loop>(store, 'loops', id)
</script>

<div>
  <span contenteditable bind:innerHTML={$loop.label}></span> |

  {formatTime($loop.startTime)} - {formatTime($loop.endTime)}
</div>
