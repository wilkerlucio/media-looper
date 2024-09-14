<script lang="ts">

  let {icon, ...restProps}: {icon: string} = $props()

</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<i class="fa fa-{icon}" {...restProps} aria-hidden="true"></i>

<style>

    i {
        cursor: pointer;
        font-size: 18px;
        padding: 0 4px;
    }

</style>
