<script lang="ts">

  import {Button, Modal} from "flowbite-svelte";
  import Settings from "@/entrypoints/dashboard/components/Settings.svelte";
  import {sp} from "@/lib/helpers/events";

  let showSettingsModal = false

</script>

<Button on:click={(e) => {showSettingsModal = true; sp(e)}}>Settings</Button>

<Modal title="Settings" bind:open={showSettingsModal} size="xs" autoclose>
  <Settings/>
</Modal>
