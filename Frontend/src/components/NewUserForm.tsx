import React, { useState } from 'react';

function NewUserForm() {
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '' });

  // Toggle form visibility
  const toggleForm = () => setFormVisible((prev) => !prev);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form behavior

    try {
      const response = await fetch('http://127.0.0.1:5000/manual_add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Server response:', result);
        setFormData({ name: '', bio: '' }); // Clear form data
        setFormVisible(false); // Close the form
      } else {
        console.error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={toggleForm} style={styles.toggleButton}>
        {formVisible ? 'Close Form' : 'Add New Connection'}
      </button>
      {formVisible && (
        <div style={styles.formWrapper}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Bio:
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                style={styles.textarea}
              />
            </label>
            <button type="submit" style={styles.submitButton}>
              Submit
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default NewUserForm;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '20px',
  },
  toggleButton: {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#e88c51',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  formWrapper: {
    marginTop: '20px',
    padding: '20px',
    width: '100%',
    maxWidth: '400px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Frosted glass effect
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)', // Adds blur effect
    WebkitBackdropFilter: 'blur(10px)', // Support for Safari
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#fff',
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    color: '#000',
  },
  textarea: {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    outline: 'none',
    minHeight: '100px',
    resize: 'none',
    transition: 'border-color 0.3s ease',
    color: '#000',
  },
  submitButton: {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#e88c51',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};
