<script lang="ts">
  import {useRow} from "@/lib/stores/tinybase-stores";
  import {formatTime} from "@/lib/helpers/time";

  export let id: string;

  const loop = useRow('loops', id)
</script>

<div>
  <span contenteditable bind:innerHTML={$loop.label}></span> |

  {formatTime($loop.startTime)} - {formatTime($loop.endTime)}
</div>
