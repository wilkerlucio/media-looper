import Admin from "@/entrypoints/admin/Admin.svelte";

const app = new Admin({
  target: document.getElementById('app')!,
});

export default app;
