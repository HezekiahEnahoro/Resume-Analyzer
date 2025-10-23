import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  FileText,
  Shield,
  Star,
} from "lucide-react";

function LandingPage({ onGetStarted }) {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "ATS Optimization",
      description:
        "Get past applicant tracking systems with our AI-powered compatibility score",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Analysis",
      description: "Upload your resume and get detailed feedback in seconds",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Job Role Matching",
      description: "See how well your skills match popular job roles",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Smart Extraction",
      description: "Automatically parse contact info, skills, and experience",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Resumes Analyzed" },
    { number: "94%", label: "Success Rate" },
    { number: "2.5x", label: "More Interviews" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Tech Corp",
      text: "This tool helped me optimize my resume for ATS systems. I got 3 interviews in the first week!",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Data Analyst",
      company: "Analytics Inc",
      text: "The detailed feedback was invaluable. My resume went from generic to compelling.",
      rating: 5,
    },
    {
      name: "Emily Thompson",
      role: "Product Manager",
      company: "StartupXYZ",
      text: "Simple, fast, and incredibly accurate. A must-have for any job seeker.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="pt-20 pb-16 text-center"
          initial="initial"
          animate="animate"
          variants={fadeInUp}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-4">
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
              ✨ Free Resume Analysis Tool
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Beat the ATS.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Land Your Dream Job.
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            75% of resumes never reach human eyes. Our AI-powered analyzer
            ensures yours does. Get instant feedback and actionable
            improvements.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-2 group">
              Analyze Your Resume Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 transition">
              See Example Analysis
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>100% Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-500" />
              <span>Results in 10 Seconds</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}>
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features Section */}
        <div className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Analyzer?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by advanced AI and NLP technology to give you the edge in
              your job search
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-14 h-14 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-20 bg-white rounded-3xl shadow-xl my-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 px-4">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Job Seekers
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands who've improved their resumes and landed interviews
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center py-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Improve Your Resume?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get instant, actionable feedback in seconds. No signup required.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-lg font-semibold text-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all">
            Start Free Analysis →
          </button>
        </motion.div>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8 text-center text-gray-600">
          <p>© 2025 Resume Analyzer. Built with ❤️ for job seekers.</p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <a href="#" className="hover:text-blue-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-600">
              Terms of Service
            </a>
            <a href="#" className="hover:text-blue-600">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
