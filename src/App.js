import { useState, useEffect } from "react";

export default function App() {
  const [screen, setScreen] = useState("settings");
  const [mode, setMode] = useState("visual");
  const [selectedColors, setSelectedColors] = useState(["red", "blue", "yellow", "green", "orange"]);
  const [selectedDirections, setSelectedDirections] = useState(["Left", "Right", "Turn", "Protect"]);
  const [currentCue, setCurrentCue] = useState("black");

  const [intervalMs, setIntervalMs] = useState(3000); // Default 3s
  const [durationLimit, setDurationLimit] = useState("infinite");
  const [language, setLanguage] = useState("en-US"); // Default to English
  const tickSound = new Audio("/tick.mp3");

  const translations = {
    "en-US": { Left: "Left", Right: "Right", Turn: "Turn", Protect: "Protect" },
    "fi-FI": { Left: "Vasen", Right: "Oikea", Turn: "Käänny", Protect: "Suojaa" }
  };

  const startDrill = () => {
    if (mode === "directions" && selectedDirections.length === 0) {
      alert("Please select at least one direction!");
      return;
    }
    if (mode === "visual" && selectedColors.length === 0) {
      alert("Please select at least one color!");
      return;
    }
    setScreen("running");
  };

  const stopDrill = () => {
    setScreen("settings");
    setCurrentCue("black");
    document.body.style.backgroundColor = "white";
  };

  const speakCue = (cue) => {
    const translatedCue = translations[language][cue] || cue;
    const utterance = new SpeechSynthesisUtterance(translatedCue);
    utterance.lang = language;
    speechSynthesis.speak(utterance);
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleDirection = (direction) => {
    setSelectedDirections((prev) =>
      prev.includes(direction) ? prev.filter((d) => d !== direction) : [...prev, direction]
    );
  };

  useEffect(() => {
    if (screen !== "running") return;

    let drillTimeout;
    if (durationLimit !== "infinite") {
      const durationInMs = parseInt(durationLimit) * 60 * 1000;
      drillTimeout = setTimeout(stopDrill, durationInMs);
    }

    const interval = setInterval(() => {
      if (mode === "visual") {
        const newColor = selectedColors[Math.floor(Math.random() * selectedColors.length)];
        setCurrentCue(newColor);
        document.body.style.backgroundColor = newColor;
      }

      if (mode === "directions") {
        tickSound.currentTime = 0;
        tickSound.play();

        setTimeout(() => {
          const newDirection = selectedDirections[Math.floor(Math.random() * selectedDirections.length)];
          setCurrentCue(newDirection);
          document.body.style.backgroundColor = "black";
          speakCue(newDirection);
        }, 1800); // 1.8s delay after tick
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
      clearTimeout(drillTimeout);
    };
  }, [screen, mode, selectedColors, selectedDirections, intervalMs, durationLimit, language]);

  if (screen === "running") {
    return (
      <div className="h-screen flex flex-col justify-center items-center text-white text-center p-6 relative">
        {/* Only show text when in directions mode */}
        {mode === "directions" && (
          <h1 className="text-6xl md:text-8xl font-bold">
            {translations[language][currentCue] || currentCue}
          </h1>
        )}

        {/* Stop Drill button at the bottom */}
        <button
          onClick={stopDrill}
          className="absolute bottom-6 bg-red-600 px-6 py-3 rounded-lg text-2xl font-bold hover:bg-red-700"
        >
          ⏹ Stop Drill
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900 p-6 text-center">
      <h1 className="text-4xl font-bold mb-8">⚽️ Scanning App</h1>

      {/* Mode Selection */}
      <div className="mb-6 w-full max-w-md">
        <label className="block text-xl font-semibold mb-2">🎮 Select Mode:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full p-3 text-lg border rounded"
        >
          <option value="visual">Visual (Colors)</option>
          <option value="directions">Directions (Audio)</option>
        </select>
      </div>

      {/* Interval Selection */}
      {mode === "visual" && (
        <div className="mb-6 w-full max-w-md">
          <label className="block text-xl font-semibold mb-2">⏳ Color Change Interval:</label>
          <select
            value={intervalMs}
            onChange={(e) => setIntervalMs(parseInt(e.target.value))}
            className="w-full p-3 text-lg border rounded"
          >
            <option value={2000}>2s</option>
            <option value={3000}>3s</option>
            <option value={5000}>5s</option>
          </select>
        </div>
      )}

      {/* Language Selection */}
      {mode === "directions" && (
        <div className="mb-6 w-full max-w-md">
          <label className="block text-xl font-semibold mb-2">🌍 Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 text-lg border rounded"
          >
            <option value="en-US">English</option>
            <option value="fi-FI">Finnish</option>
          </select>
        </div>
      )}

      {/* Direction Selection */}
      {mode === "directions" && (
        <div className="mb-6 w-full max-w-md">
          <label className="block text-xl font-semibold mb-2">🏃 Select Directions:</label>
          <div className="grid grid-cols-2 gap-4">
            {["Left", "Right", "Turn", "Protect"].map((direction) => (
              <button
                key={direction}
                onClick={() => toggleDirection(direction)}
                className={`p-4 text-xl border rounded-lg ${
                  selectedDirections.includes(direction)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {translations[language][direction]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={startDrill}
        className="bg-blue-600 text-white px-10 py-5 rounded-lg text-2xl font-bold hover:bg-blue-700"
      >
        ▶️ Start Drill
      </button>
    </div>
  );
}
