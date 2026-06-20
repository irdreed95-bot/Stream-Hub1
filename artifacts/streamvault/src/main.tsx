import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.classList.add("dark");
if (localStorage.getItem('rtl_mode') === '1') {
  document.documentElement.setAttribute('dir', 'rtl');
}

createRoot(document.getElementById("root")!).render(<App />);
