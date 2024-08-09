<script lang="ts">
  export let icon;
</script>

<i class="fa fa-{icon}" {...$$restProps} on:click />

<style>

    i {
        cursor: pointer;
        font-size: 18px;
        padding: 0 4px;
    }

</style>
