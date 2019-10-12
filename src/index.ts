import { h, render } from "preact";
import "./normalize.css";
import App from "./App";

// Render the App component to the root element
const rootElement = document.getElementById("app-root");
if (rootElement) render(h(App, {}), rootElement);
