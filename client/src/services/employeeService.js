import axios from 'axios';

export const getEmployees = async (params) => {
  try {
    const response = await axios.get('http://localhost:5001/api/employees', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw new Error('Failed to fetch employees');
  }
};

export const addEmployee = async (employee) => {
  try {
    const response = await axios.post('http://localhost:5001/api/employees', employee, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Return the response data containing the new employee
  } catch (error) {
    console.error('Error adding employee:', error);
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error.message);
    } else {
      throw new Error('Failed to add employee');
    }
  }
};

export const updateEmployee = async (id, updatedEmployee) => {
  try {
    const response = await axios.put(`http://localhost:5001/api/employees/${id}`, updatedEmployee, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw new Error(error.response?.data?.message || 'Failed to update employee');
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:5001/api/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw new Error('Failed to delete employee');
  }
};

export const toggleEmployeeStatus = async (id) => {
  try {
    const response = await axios.put(`http://localhost:5001/api/employees/${id}/active`);
    return response.data;
  } catch (error) {
    console.error('Error toggling employee status:', error);
    throw error; // Re-throw the error after logging
  }
};
