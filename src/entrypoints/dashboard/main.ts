import './dashboard.css'
import DashboardWrapper from "@/entrypoints/dashboard/components/DashboardWrapper.svelte";

const app = new DashboardWrapper({
  target: document.getElementById('app')!,
});

export default app;
