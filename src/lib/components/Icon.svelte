<script lang="ts">
  export let icon: string;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<i class="fa fa-{icon}" {...$$restProps} aria-hidden="true"></i>

<style>

    i {
        cursor: pointer;
        font-size: 18px;
        padding: 0 4px;
    }

</style>
