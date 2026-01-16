import Button from "@mui/material/Button";
import { useState } from "preact/hooks";
import logo from "../assets/logo-fillable.svg?react";
import { BottleGrid } from "../components/bottle-grid";
import { startEffects } from "../utils/effects.utils";
import { machine } from "../utils/state.utils";

/**
 * The main application
 * @returns the application component
 */
export function App() {
  const [state, setState] = useState<(typeof machine)["state"]>("initial");
  machine.watchContext("state", () => setState(machine.state));
  // biome-ignore lint/suspicious/noConsole: remove me later ^^
  console.count("render"); // oxlint-disable-line no-console
  return (
    <div className="container mx-auto flex h-screen w-full max-w-xl flex-col items-center justify-center gap-6 pb-44 align-middle">
      {logo({ className: `${state === "initial" ? "pt-24 pb-6 w-4/5 fill-purple-900" : "w-56 fill-transparent hidden md:block"} drop-shadow-lg transition-all`, title: "app logo" })}
      {state === "initial" && (
        <Button
          onClick={() => {
            machine.start();
            startEffects();
          }}
          variant="contained"
        >
          Start game
        </Button>
      )}
      {state !== "initial" && (
        <>
          <BottleGrid state={state} />
          <Button
            color="warning"
            onClick={() => {
              machine.reset();
              startEffects();
            }}
            variant="contained"
          >
            Reset game
          </Button>
        </>
      )}
    </div>
  );
}
