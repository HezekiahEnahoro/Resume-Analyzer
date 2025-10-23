import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import ResumeAnalyzer from "./components/ResumeAnalyzer";

function App() {
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  return (
    <div className="min-h-screen">
      {!showAnalyzer ? (
        <LandingPage onGetStarted={() => setShowAnalyzer(true)} />
      ) : (
        <ResumeAnalyzer onBack={() => setShowAnalyzer(false)} />
      )}
    </div>
  );
}

export default App;
