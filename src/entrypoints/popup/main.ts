import './app.css';
import App from './components/App.svelte';
import {mount} from "svelte";

mount(App, {
  target: document.getElementById('app')!,
})
