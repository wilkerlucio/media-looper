import './admin.css'
import AdminWrapper from "@/entrypoints/admin/components/AdminWrapper.svelte";

const app = new AdminWrapper({
  target: document.getElementById('app')!,
});

export default app;
