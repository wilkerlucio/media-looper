<script lang="ts">
  import {getStoreForce} from "@/lib/stores/tinybase-stores";

  const store = getStoreForce()

  console.log('tables', store.getTableIds())
  console.log(store.getTable('medias'))
</script>

<div>Popup contents!</div>
