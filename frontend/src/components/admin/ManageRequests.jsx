import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const ManageRequests = () => {
    
  const [requests, setRequests] = useState([
    {
      id: 1,
      institute: 'Lums University',
      admin: 'Ali',
      email: 'ali@gift.edu.pk',
      status: 'pending'
    },
    {
      id: 2,
      institute: 'Bahria University',
      admin: 'Zain',
      email: 'zain@pu.edu.pk',
      status: 'pending'
    },
    {
      id: 3,
      institute: 'Punjab College',
      admin: 'Rehman',
      email: 'rehman@tlh.edu.pk',
      status: 'pending'
    },
    // Add more sample data if needed
  ]);

  const handleApprove = (id) => {
    const updatedRequests = requests.map(request =>
      request.id === id ? { ...request, status: 'approved' } : request
    );
    setRequests(updatedRequests);
    alert(`Request approved for institute ID: ${id}`);
  };

  const handleReject = (id) => {
    const updatedRequests = requests.map(request =>
      request.id === id ? { ...request, status: 'rejected' } : request
    );
    setRequests(updatedRequests);
    alert(`Request rejected for institute ID: ${id}`);
  };

  const handleMail = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-blue-600 p-4 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Manage Requests</h1>
            <div className="flex items-center space-x-2">
              <span className="text-white">ADMIN</span>
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow">
            {/* Table Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-semibold text-black">Institute Requests</h2>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr className="bg-white text-gray-800">
                  <th className="px-6 py-3 text-left">RequestID</th>
                  <th className="px-6 py-3 text-left">Institute</th>
                  <th className="px-6 py-3 text-left">Admin</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-t text-gray-700">
                    <td className="px-6 py-4">{request.id}</td>
                    <td className="px-6 py-4">{request.institute}</td>
                    <td className="px-6 py-4">{request.admin}</td>
                    <td className="px-6 py-4">{request.email}</td>
                    <td className="px-6 py-4">{request.status}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleMail(request.email)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageRequests;
