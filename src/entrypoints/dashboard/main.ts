import './dashboard.css'
import DashboardWrapper from "@/entrypoints/dashboard/components/DashboardWrapper.svelte";
import {mount} from "svelte";

mount(DashboardWrapper, {
  target: document.getElementById('app')!,
})
