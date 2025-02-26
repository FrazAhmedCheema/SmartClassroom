import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddEntityModal = ({ isOpen, onClose, onSubmit, entityType }) => {
  const [formData, setFormData] = useState({
    name: '',
    registrationId: '',
    email: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (/\d/.test(formData.name)) {
      newErrors.name = 'Name cannot contain numbers';
    }

    if (!formData.registrationId) {
      newErrors.registrationId = 'Registration ID is required';
    } else if (formData.registrationId.length < 5) {
      newErrors.registrationId = 'Registration ID must be at least 5 characters long';
    }


    const subAdminUsername = localStorage.getItem('subAdminUsername');
    const subAdminDomain = subAdminUsername ? subAdminUsername.split('@')[1] : '';
    const emailDomain = formData.email.split('@')[1];

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (emailDomain !== subAdminDomain) {
      
      
        console.log("Sub admin domain is " + subAdminDomain);
      newErrors.email = `You can only add users with the domain "${subAdminDomain}"`;
      
    }

    // if (!formData.email) {
    //   newErrors.email = 'Email is required';
    // } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   newErrors.email = 'Email is invalid';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate() && !isSubmitting) {
      setIsSubmitting(true);
      // Delegate submission to the parent; removed fetch call.
      onSubmit(formData);
      setFormData({
        name: '',
        registrationId: '',
        email: '',
        status: 'active'
      });
      setErrors({});
      onClose();
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
        {/* Fixed Header with Close Button */}
        <div className="bg-gray-50 px-8 py-4 rounded-t-xl border-b-2 border-gray-100 sticky top-0 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Add New {entityType}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200 
                     flex items-center justify-center group"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-white group-hover:text-red-500 transition-colors" />
          </button>
        </div>
        
        {/* Scrollable Form Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-base">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           text-gray-900 text-base font-medium placeholder-gray-400
                           hover:border-blue-400 transition-colors"
                  required
                  placeholder="Enter name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-base">Registration ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="registrationId"
                  value={formData.registrationId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           text-gray-900 text-base font-medium placeholder-gray-400
                           hover:border-blue-400 transition-colors"
                  required
                  placeholder="Enter registration ID"
                />
                {errors.registrationId && <p className="text-red-500 text-sm mt-1">{errors.registrationId}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-base">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           text-gray-900 text-base font-medium placeholder-gray-400
                           hover:border-blue-400 transition-colors"
                  required
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-base">Status <span className="text-red-500">*</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           text-gray-900 text-base font-medium
                           hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            {errors.submit && <p className="text-red-500 text-sm mt-4">{errors.submit}</p>}
            <div className="mt-8 flex justify-end space-x-4 border-t pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-white text-gray-800 font-medium text-sm rounded-lg
                         hover:bg-gray-100 transition-all duration-300
                         border-2 border-gray-300 hover:border-gray-400
                         focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg
                         hover:bg-blue-700 transition-all duration-300
                         shadow-sm hover:shadow-lg transform hover:-translate-y-0.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Add {entityType}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEntityModal;