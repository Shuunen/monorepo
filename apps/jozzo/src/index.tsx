import { render } from "preact";
import { App } from "./components/app";
import "./style.css";

const mountingElement = document.querySelector<HTMLElement>("#app");
if (!mountingElement) throw new Error("Could not find #app");
render(<App />, mountingElement);
