import React, { useState } from 'react'; // Ensure useState is imported
import PropTypes from 'prop-types';
import { updateEmployee } from '../services/employeeService';

const EditEmployee = ({ employee, onClose, onUpdate }) => {
  const designations = ['Developer', 'Manager', 'Designer', 'Tester', 'HR']; // Define designations array
  const courses = ['BCA', 'MCA', 'BSC']; // Ensure only these courses are available

  const [formData, setFormData] = useState({
    name: employee.name || '',
    email: employee.email || '',
    mobile: employee.mobile || '',
    designation: employee.designation || '',
    course: Array.isArray(employee.course) ? employee.course : [],
    gender: employee.gender || '',
    image: employee.image || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Validate mobile number to only accept digits
    if (name === 'mobile' && value !== '' && !/^\d+$/.test(value)) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      course: checked
        ? (prev.course.includes(value) ? prev.course : [...prev.course, value]) // Prevent duplicates
        : prev.course.filter((course) => course !== value),
    }));
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (formData.mobile.length < 10) {
      setError('Mobile number must be at least 10 digits');
      return;
    }

    // Remove duplicate courses
    const uniqueCourses = [...new Set(formData.course)];
    
    try {
      setLoading(true);
      const data = new FormData();
      for (const key in formData) {
        if (key === 'course') {
          uniqueCourses.forEach(course => data.append('course', course));
        } else {
          data.append(key, formData[key]);
        }
      }
      // Only append the image if it is selected
      if (image) {
        data.append('image', image);
      }
      await updateEmployee(employee._id, data);
      setSuccess('Employee updated successfully!');
      setTimeout(() => {
        onUpdate(); // Refresh the employee list
        onClose(); // Close the modal
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Employee</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Mobile *
          </label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
            maxLength={15} // Updated from 3 to 15
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Designation *
          </label>
          <select
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          >
            <option value="">Select Designation</option>
            {designations.map((designation) => (
              <option key={designation} value={designation}>
                {designation}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Course *
          </label>
          <div className="flex flex-wrap">
            {courses.map((course) => (
              <label key={course} className="flex items-center mr-4">
                <input
                  type="checkbox"
                  name="course"
                  value={course}
                  checked={formData.course.includes(course)}
                  onChange={handleCourseChange}
                  className="mr-2"
                />
                {course}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Gender *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={formData.gender === 'Male'}
                onChange={handleChange}
                required
                className="mr-2"
              />
              Male
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={formData.gender === 'Female'}
                onChange={handleChange}
                required
                className="mr-2"
              />
              Female
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="Other"
                checked={formData.gender === 'Other'}
                onChange={handleChange}
                required
                className="mr-2"
              />
              Other
            </label>
          </div>
        </div>

        <div>
          <label className="block text-gray-700">Image</label>
          {formData.image ? (
            <img
              src={`http://localhost:5001/${formData.image}`} // Updated src to use absolute URL
              alt={formData.name}
              className="w-20 h-20 rounded-full mb-2 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-white mb-2">
              {formData.name.charAt(0).toUpperCase()}
            </div>
          )}
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded"
          />
          {image && (
            <div className="mt-2">
              <p className="text-gray-700">New Image Preview:</p>
              <img
                src={URL.createObjectURL(image)}
                alt="New Preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

EditEmployee.propTypes = {
  employee: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    mobile: PropTypes.string,
    designation: PropTypes.string,
    course: PropTypes.arrayOf(PropTypes.string),
    gender: PropTypes.string,
    image: PropTypes.string,
    _id: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default EditEmployee;
