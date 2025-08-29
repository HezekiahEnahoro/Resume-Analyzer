import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function yearsFromEarliest(a) {
  const y = a?.earliest_year_seen;
  const thisYear = new Date().getFullYear();
  if (!y || y < 1990 || y > thisYear) return null;
  return Math.max(0, thisYear - y);
}

function prettyMatchScores(scores) {
  if (!scores) return null;
  if (Array.isArray(scores)) return scores.join(", ");
  if (typeof scores === "object") {
    return Object.entries(scores)
      .map(([k, v]) => `${k}: ${v}%`)
      .join(", ");
  }
  return String(scores);
}

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API = import.meta.env.VITE_RESUME_API || "http://127.0.0.1:5000";

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setMessage("");
    setAnalysis(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file); // backend expects "file"

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API}/analyze`,
        formData /* no headers needed */
      );
      setAnalysis(data);
      setMessage(data.message || "Upload successful");
    } catch (err) {
      console.error("Error uploading file:", err);
      const serverMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to upload.";
      setMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const years = yearsFromEarliest(analysis);
  const matchScoresText = prettyMatchScores(analysis?.match_scores);

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 items-center">
        <input
          type="file"
          accept=".pdf,.docx" /* remove .doc – backend only supports pdf/docx */
          onChange={handleFileChange}
          className="border p-2 rounded"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !file}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? "Analyzing..." : "Upload and Analyze"}
        </button>
        {loading && (
          <div className="flex justify-center mt-2">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        )}
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-md text-left space-y-2 mt-6">
          <p>
            <strong>👤 Name:</strong> {analysis.name || "N/A"}
          </p>
          <p>
            <strong>📧 Email:</strong> {analysis.email || "N/A"}
          </p>
          <p>
            <strong>☎ Phone:</strong> {analysis.phone || "N/A"}
          </p>

          <p>
            <strong>🛠 Skills:</strong>{" "}
            {Array.isArray(analysis.skills) && analysis.skills.length
              ? analysis.skills.join(", ")
              : "N/A"}
          </p>

          <p>
            <strong>🎓 Education:</strong>{" "}
            {Array.isArray(analysis.education) && analysis.education.length
              ? analysis.education.map((e) => e.text).join(", ")
              : "N/A"}
          </p>

          <p>
            <strong>📈 Years of Experience:</strong> {years ?? "N/A"}
          </p>

          <p>
            <strong>🔝 Best Match:</strong> {analysis.best_match || "N/A"}
          </p>

          <p>
            <strong>🆚 Match Scores:</strong> {matchScoresText || "N/A"}
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
