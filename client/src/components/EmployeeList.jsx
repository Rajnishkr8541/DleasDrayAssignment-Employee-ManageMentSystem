import React, { useEffect, useState } from 'react';
import { getEmployees, deleteEmployee, toggleEmployeeStatus } from '../services/employeeService';
import EditEmployee from './EditEmployee';
import AddEmployee from './AddEmployee';
import { format } from 'date-fns'; // Import date-fns for formatting dates

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(10);
  const [sortField, setSortField] = useState('createDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalActiveEmployees, setTotalActiveEmployees] = useState(0);

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm, sortField, sortOrder]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: employeesPerPage,
        search: searchTerm,
        sortField,
        sortOrder,
      };
      const data = await getEmployees(params);
      setEmployees(data.employees);
      setTotalEmployees(data.totalEmployees);
      setTotalActiveEmployees(data.totalActiveEmployees);
    } catch (error) {
      setError('Failed to fetch employees. Please try again later.');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleUpdate = () => {
    fetchEmployees();
    setSelectedEmployee(null);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(employeeId);
        await fetchEmployees();
      } catch (error) {
        setError('Failed to delete employee. Please try again later.');
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleEmployeeStatus(id);
      fetchEmployees();
    } catch (error) {
      setError('Failed to update employee status.');
    }
  };

  return (
    <div className="overflow-x-auto">
      {selectedEmployee && (
        <EditEmployee
          employee={selectedEmployee} // Pass employee data
          onClose={() => setSelectedEmployee(null)} // Pass onClose function
          onUpdate={handleUpdate} // Pass onUpdate function
        />
      )}

      {showAddEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <AddEmployee
              onClose={() => setShowAddEmployee(false)}
              onAdd={(newEmployee) => {
                setShowAddEmployee(false);
                setEmployees((prevEmployees) => [...prevEmployees, newEmployee]); // Append new employee to the state
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center text-gray-500 my-8">
          <p>No employees found</p>
        </div>
      ) : (
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-3 py-2 border rounded"
            />
            <p>
              Total Employees: {totalEmployees} | Active Employees: {totalActiveEmployees}
            </p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Image
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Name {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Create Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee._id} className={`hover:bg-gray-50 ${!employee.active ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.image ? (
                      <img
                        src={`http://localhost:5001/${employee.image}`} // Corrected src to avoid double 'uploads/'
                        alt={employee.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-600">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.mobile}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {Array.isArray(employee.course) ? [...new Set(employee.course)].join(', ') : employee.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(employee.createDate), 'dd-MMM-yy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEditClick(employee)}
                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(employee._id)}
                      className="text-white bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                      {employee.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={employees.length < employeesPerPage}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowAddEmployee(true)}
          className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add Employee
        </button>
      </div>
    </div>
  );
};

export default EmployeeList;
