"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useAuth0 } from '@auth0/auth0-react';

import MeshLogo from './MeshLogo';

function Navbar() {
  const [resume, setResume] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth0();

  // Handle file upload
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const supportedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      // Validate file type
      if (!supportedTypes.includes(file.type)) {
        setMessage('Unsupported file type. Please upload a PDF, DOC, or DOCX file.');
        setTimeout(() => setMessage(null), 5000);
        return;
      }

      setResume(file);

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('resume', file);

      // Include the Auth0 user ID in the request
      if (user && isAuthenticated) {
        formData.append('auth0_id', user.sub);
      }

      try {
        // Send the file to the Flask backend
        const response = await fetch('http://localhost:5000/upload-resume', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload resume.');
        }

        const data = await response.json();
        setMessage(data.message || 'Successfully uploaded!');

        // ✅ Remove message after 5 seconds
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      } catch (error) {
        console.error('Error uploading resume:', error);
        setMessage('An error occurred while uploading the resume. Please try again.');

        // ✅ Remove message after 5 seconds
        setTimeout(() => {
          setMessage(null);
        }, 2500);
      }
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-gray-900 text-white shadow-lg z-50 transition-all duration-300 ease-in-out ${
        isHovered ? 'w-[40%]' : 'w-16'
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
        <div className="p-6">
          {!isLoading && isAuthenticated && user && (
            <b>
              <h2 style={styles.greeting}>Hey {user.given_name || user.name}! 👋🏼</h2>
            </b>
          )}
          <h1 className="text-xl mb-4">Upload Your Resume</h1>
          <label
            htmlFor="resumeUpload"
            className="bg-white text-[#303d4e] px-4 py-2 rounded cursor-pointer font-bold hover:bg-gray-200"
          >
            Upload Resume
          </label>
          <input
            id="resumeUpload"
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleResumeUpload}
          />

          {resume && (
            <div className="mt-4">
              <p className="font-bold text-green-500">File Uploaded: {resume.name}</p>
            </div>
          )}

          {resume && resume.type === 'application/pdf' ? (
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

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#303d4e',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: '20px',
    marginLeft: '220px',
  },
  greeting: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: 'white',
  },
};


// function App() {
//   return (
//     <div className="flex min-h-screen bg-[#303d4e] text-white">
//       <Navbar />
//       <div className="flex-1 p-10">
//       <MeshLogo/>

//         <h1 className="text-4xl">Main Content Area</h1>
//         <p className="mt-4 text-lg">This content stays static and does not adjust when the navbar expands.</p>
//       </div>
//     </div>
//   );
// }

// export default App;
