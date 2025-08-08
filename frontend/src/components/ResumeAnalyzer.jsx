import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };
  // Make sure axios is installed

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // ensure backend expects "file"
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;
      console.log(result);
      setAnalysis(result);
      setMessage(result.message || "Upload successful");
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Failed to upload.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 items-center">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          {loading ? "Analyzing..." : "Upload and Analyze"}
        </button>
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        )}
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-md text-left space-y-1">
          <p>
            <strong>👤 Name:</strong> {analysis.name || "N/A"}
          </p>
          <p>
            <strong>📧 Email:</strong> {analysis.email || "N/A"}
          </p>
          <p>
            <strong>🛠 Skills:</strong> {analysis.skills?.join(", ") || "N/A"}
          </p>
          <p>
            <strong>📈 Years of Experience:</strong>{" "}
            {analysis.experience_years || "N/A"}
          </p>
          <p>
            <strong>🔝 Best Match:</strong> {analysis.best_match || "N/A"}
          </p>
          <p>
            <strong>🆚 Match Scores:</strong>{" "}
            {(analysis.match_scores && (
              <div className="mt-2">
                <ul className="space-y-1">
                  {Object.entries(analysis.match_scores).map(
                    ([role, score]) => (
                      <li key={role} className="text-sm text-gray-700">
                        <span className="font-medium">{role}:</span> {score}%
                      </li>
                    )
                  )}
                </ul>
              </div>
            )) ||
              "N/A"}
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
