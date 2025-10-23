import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Upload,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  Briefcase,
  TrendingUp,
  Target,
  Lightbulb,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";

function yearsFromEarliest(a) {
  const y = a?.earliest_year_seen;
  const thisYear = new Date().getFullYear();
  if (!y || y < 1990 || y > thisYear) return null;
  return Math.max(0, thisYear - y);
}

function ATSScoreGauge({ score }) {
  const getColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="transform -rotate-90 w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${getColor(
              score
            )} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${getColor(score)}`}>
            {score}
          </span>
          <span className="text-sm text-gray-500">/ 100</span>
        </div>
      </div>
      <p className={`mt-4 text-lg font-semibold ${getColor(score)}`}>
        {getLabel(score)}
      </p>
    </div>
  );
}

function ImprovementSuggestion({ icon, title, description, priority }) {
  const priorityColors = {
    high: "border-red-200 bg-red-50",
    medium: "border-yellow-200 bg-yellow-50",
    low: "border-blue-200 bg-blue-50",
  };

  const IconComponent =
    icon === "AlertTriangle"
      ? AlertTriangle
      : icon === "Lightbulb"
      ? Lightbulb
      : icon === "CheckCircle"
      ? CheckCircle
      : Lightbulb;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border-l-4 ${priorityColors[priority]} p-4 rounded-r-lg`}>
      <div className="flex items-start gap-3">
        <IconComponent className="w-5 h-5 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ResumeAnalyzer({ onBack }) {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const API = import.meta.env.VITE_RESUME_API || "http://127.0.0.1:5000";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
      setAnalysis(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage("");
      setAnalysis(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/analyze`, formData);
      setAnalysis(data);
      setMessage("");

      // Track analytics event
      if (window.va) {
        window.va("track", "Resume Analyzed", {
          ats_score: data.ats_score,
          best_match: data.best_match,
        });
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <div className="text-sm text-gray-500">Free Analysis</div>
        </div>

        {!analysis ? (
          /* Upload Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Upload Your Resume
              </h2>
              <p className="text-gray-600">
                Get instant feedback on your resume's ATS compatibility
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {file
                      ? file.name
                      : "Drop your resume here or click to browse"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF and DOCX (Max 5MB)
                  </p>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    Analyze Resume
                  </>
                )}
              </button>

              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="text-sm">{message}</p>
                </motion.div>
              )}
            </form>
          </motion.div>
        ) : (
          /* Analysis Results */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6">
            {/* ATS Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ATS Compatibility Score
                </h3>
                <p className="text-gray-600">
                  How well your resume performs with Applicant Tracking Systems
                </p>
              </div>
              <div className="flex justify-center">
                <ATSScoreGauge score={analysis.ats_score || 75} />
              </div>
            </motion.div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">
                        {analysis.name || "Not found"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Mail className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {analysis.email || "Not found"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">
                        {analysis.phone || "Not found"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Experience & Education */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Experience & Education
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Years of Experience
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {years ?? "N/A"} {years && "years"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Education</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(analysis.education) &&
                      analysis.education.length ? (
                        analysis.education.map((e, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                            {e.text}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Skills & Job Match */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Skills & Job Role Match
              </h4>

              {/* Skills */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Detected Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(analysis.skills) && analysis.skills.length ? (
                    analysis.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No skills detected</span>
                  )}
                </div>
              </div>

              {/* Match Scores */}
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Best Match:{" "}
                  <span className="font-semibold text-blue-600">
                    {analysis.best_match || "N/A"}
                  </span>
                </p>
                <div className="space-y-3">
                  {analysis.match_scores &&
                    Object.entries(analysis.match_scores).map(
                      ([role, score]) => (
                        <div key={role}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{role}</span>
                            <span className="font-semibold text-gray-900">
                              {score}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      )
                    )}
                </div>
              </div>
            </motion.div>

            {/* Improvement Suggestions */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Improvement Suggestions
                </h4>
                <div className="space-y-4">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <ImprovementSuggestion key={idx} {...suggestion} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setFile(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                Analyze Another Resume
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition">
                Download Report
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
