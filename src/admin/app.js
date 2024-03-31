import { createRoot } from "react-dom/client";
import { Button } from './Button'

function App() {
    return <h1><Button>Hello world!</Button></h1>;
}

const container = document.getElementById("app");
const root = createRoot(container)
root.render(<App />);
