import { useState } from "react";

export const useResumeUpload = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resume, setResume] = useState<File | null>(null);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const supportedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      // Validate file type
      if (!supportedTypes.includes(file.type)) {
        setMessage("Unsupported file type. Please upload a PDF, DOC, or DOCX file.");
        setTimeout(() => setMessage(null), 5000);
        return;
      }

      setResume(file);
      setIsLoading(true); // Start loading state

      // Create FormData and append the file
      const formData = new FormData();
      formData.append("resume", file);

      try {
        // Send the file to the Flask backend
        const response = await fetch("http://127.0.0.1:5000/upload-resume", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload resume.");
        }

        const data = await response.json();
        setMessage(data.message || "Successfully uploaded!");
      } catch (error) {
        console.error("Error uploading resume:", error);
        setMessage("An error occurred while uploading the resume. Please try again.");
      } finally {
        setIsLoading(false); // End loading state regardless of outcome
        setTimeout(() => {
          setMessage(null);
        }, 5000); // Remove message after a delay
      }
    }
  };

  return {
    handleResumeUpload,
    isLoading,
    message,
    resume,
  };
};
