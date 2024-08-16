<script lang="ts">
  import {useRow} from "@/lib/stores/tinybase-stores";
  import {Button} from "flowbite-svelte";
  import {formatTime} from "@/lib/helpers/time";

  export let id: string;

  const loop = useRow('loops', id)
</script>

<div>
<!--  <Button on:click={() => $loop.startTime += 1}>Increase start</Button>-->

  {$loop.label} |

  {formatTime($loop.startTime)} - {formatTime($loop.endTime)}
</div>
