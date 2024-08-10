<script lang="ts">
  import {formatTime, secondsFromTime} from "@/lib/helpers/time";

  export let value;
  let editing = false;

  $: baseValue = typeof value === "number" ? formatTime(value, 3) : value
</script>

{#if editing}

  <!-- svelte-ignore a11y-autofocus -->
  <input
    autofocus
    type="text"
    bind:value={baseValue}

    on:blur={() => {
      editing = false
      if (baseValue) value = secondsFromTime(baseValue) || value
    }}

    on:keydown|stopPropagation={(e) => {
      if (e.code === "Enter" || e.code === "NumpadEnter") e.target.blur()
      if (e.code === "Escape") {
        baseValue = formatTime(value, 3)
        e.target.blur()
    }}}

    on:keyup|stopPropagation
  />
{:else}
  <div on:click={() => editing = true} aria-hidden="true">
    <slot/>
  </div>
{/if}

<style>

    div {
        cursor: pointer;
    }

    input {
        border: none;
        background: none;
        color: #fff;
        font-size: 11px;
        font-family: "YouTube Noto", Roboto, Arial, Helvetica, sans-serif;
        padding: 0;
        width: 50px;
    }

</style>
