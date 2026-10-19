import { initializeJSSynth } from "./main.js";

initializeJSSynth().catch((error) => {
  console.error("JSSynth failed to initialize:", error);
});
