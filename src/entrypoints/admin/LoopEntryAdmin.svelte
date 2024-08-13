<script lang="ts">
  import {useRow} from "@/lib/stores/tinybase-stores";

  export let id: string;

  const loop = useRow('loops', id)
</script>

<div>
  {$loop.label}

  <button on:click={() => $loop.startTime += 1}>Increase start</button> {$loop.startTime}
  {$loop.endTime}
</div>
