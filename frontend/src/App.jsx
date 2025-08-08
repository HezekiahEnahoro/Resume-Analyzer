import ResumeAnalyzer from "./components/ResumeAnalyzer";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100p-6">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          Resume Analyzer
        </h1>
        <ResumeAnalyzer />
      </div>
    </div>
  );
}

export default App
