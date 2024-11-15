import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeList from '../components/EmployeeList';
import AddEmployee from '../components/AddEmployee';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-500 to-blue-500">
      {/* Header */}
      <header className="bg-white shadow-lg p-6 flex justify-between items-center rounded-b-3xl">
        <h1 className="text-3xl font-semibold text-gray-800">Employee Management</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition duration-300"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          {/* Add Employee Section */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Employee List</h2>
            <button
              onClick={() => setShowAddEmployee(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition duration-300"
            >
              Add Employee
            </button>
          </div>

          {/* Add Employee Form */}
          {showAddEmployee && (
            <AddEmployee
              onClose={() => setShowAddEmployee(false)}
              onAdd={(newEmployee) => {
                setShowAddEmployee(false);
                setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
              }}
            />
          )}

          {/* Employee List */}
          <EmployeeList employees={employees} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
