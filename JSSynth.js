void import("./src/main.js")
  .then(({ initializeJSSynth }) => initializeJSSynth())
  .catch((error) => {
    console.error("JSSynth failed to initialize:", error);
  });
