<script lang="ts">
  import {formatTime, secondsFromTime} from "@/lib/helpers/time";
  import {sp} from "@/lib/helpers/events";

  let {value = $bindable(), formatPrecision}: {
    value: any,
    formatPrecision: number | undefined
  } = $props()

  let input: HTMLInputElement | undefined = $state()

  let editing = $state(false);
  let baseValue = $state(typeof value === "number" ? formatTime(value, 3) : value)

  function startEditing() {
    editing = true
    baseValue = typeof value === "number" ? formatTime(value, 3) : value
  }

  $effect(() => {
    if (input) {
      input.focus()
    }
  })
</script>

{#if editing}
  <input
    type="text"
    bind:this={input}
    bind:value={baseValue}

    onblur={() => {
      editing = false
      if (baseValue) value = secondsFromTime(baseValue) || value
    }}

    onkeydowncapture={sp((e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "NumpadEnter") e.target.blur()
      if (e.code === "Escape") {
        baseValue = formatTime(value, 3)
        e.target.blur()
    }})}

    onkeyupcapture={sp}
  />
{:else}
  <div onclick={startEditing} aria-hidden="true">
    {formatTime(value, formatPrecision)}
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
