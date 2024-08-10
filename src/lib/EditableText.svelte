<script lang="ts">
  export let value;
  let editing = false;

  $: baseValue = typeof value === "number" ? value.toFixed(3) : value
</script>

{#if editing}
  <input
    autofocus
    type="number"
    bind:value={baseValue}

    on:blur={() => {
      editing = false
      if (baseValue) value = baseValue
    }}

    on:keydown|stopPropagation={(e) => {
      if (e.code === "Enter" || e.code === "NumpadEnter") e.target.blur()
      if (e.code === "Escape") {
        baseValue = value
        e.target.blur()
    }}}

    on:keyup|stopPropagation
  />
{:else}
  <div on:click={() => editing = true}>
    <slot/>
  </div>
{/if}

<style>

    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type=number] {
        -moz-appearance: textfield;
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
