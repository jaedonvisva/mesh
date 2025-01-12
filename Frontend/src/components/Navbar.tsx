"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useResumeUpload } from "./ResumeUpload"; // Custom hook for resume upload

function Navbar() {
  const [isHovered, setIsHovered] = useState(false);
  const { handleResumeUpload, isLoading, message, resume } = useResumeUpload(); // Using the custom hook

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-gray-900 text-white shadow-lg z-50 transition-all duration-300 ease-in-out ${
        isHovered ? "w-[40%]" : "w-16"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Icon */}
      <div className="p-6 text-3xl flex items-center justify-center">
        <FontAwesomeIcon icon={faBars} />
      </div>

      {/* Expanded Content */}
      {isHovered && (
        <div className="p-6 space-y-4">
          <h1 className="text-xl mb-4">Upload Your Resume</h1>

          {/* Resume Upload Input */}
          <div className="relative">
            <label
              htmlFor="resumeUpload"
              className={`inline-block bg-white text-[#303d4e] px-4 py-2 rounded cursor-pointer font-bold transition-colors ${
                isLoading ? "bg-gray-300 cursor-not-allowed" : "hover:bg-gray-200"
              }`}
            >
              {isLoading ? "Uploading..." : "Upload Resume"}
            </label>
            <input
              id="resumeUpload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleResumeUpload} // Trigger the upload
              disabled={isLoading}
            />
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-t-blue-500 border-r-blue-500 border-b-blue-200 border-l-blue-200 rounded-full animate-spin" />
              <span className="text-sm text-gray-300">Uploading resume...</span>
            </div>
          )}

          {/* Message Feedback */}
          {message && (
            <div
              className={`text-sm ${
                message.includes("error") ? "text-red-500" : "text-green-500"
              }`}
            >
              {message}
            </div>
          )}

          {/* Uploaded File Information */}
          {resume && !isLoading && (
            <div className="mt-4">
              <p className="font-bold text-green-500">File Uploaded: {resume.name}</p>
            </div>
          )}

          {/* File Preview for PDFs */}
          {resume && resume.type === "application/pdf" ? (
            <div className="mt-6">
              <h2 className="text-lg font-bold mb-2">Preview:</h2>
              <iframe
                src={URL.createObjectURL(resume)}
                className="w-full h-[70vh] bg-white rounded-lg shadow-md"
                title="PDF Preview"
              ></iframe>
            </div>
          ) : resume ? (
            <div className="mt-6">
              <p className="text-red-500">Preview is only available for PDF files.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default Navbar;
