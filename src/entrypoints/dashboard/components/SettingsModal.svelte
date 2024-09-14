<script lang="ts">

  import {Button, Modal} from "flowbite-svelte";
  import Settings from "@/entrypoints/dashboard/components/Settings.svelte";

  let showSettingsModal = $state(false)

</script>

<Button onclick={() => showSettingsModal = true} class="gap-2">
  Settings
</Button>

<Modal title="Settings" bind:open={showSettingsModal} size="xs" autoclose>
  <Settings/>
</Modal>
