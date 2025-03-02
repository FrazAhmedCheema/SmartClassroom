import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ChevronDown, Mail, UserPlus, MoreVertical, Search } from 'lucide-react';

const PeopleTab = ({ classData, userRole }) => {
  const isTeacher = userRole === 'Teacher';
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  // Use the data from props and fall back to empty arrays
  const teachers = classData?.teachers || [];
  const students = classData?.students || [];

  const handleInvite = (e) => {
    e.preventDefault();
    // Handle invitation logic
    console.log('Inviting:', inviteEmail);
    setInviteEmail('');
    setShowInviteForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      {/* Teacher section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Teachers</h2>
          <div className="text-sm text-gray-500">{teachers.length} teachers</div>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {teachers.length > 0 ? (
            teachers.map((teacher, index) => (
              <div 
                key={teacher.id || index}
                className={`flex items-center justify-between p-4 ${
                  index !== teachers.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: '#1b68b3' }}>
                    {teacher.name ? teacher.name.charAt(0) : 'T'}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">{teacher.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail size={14} className="mr-1" />
                      {teacher.email}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No teachers assigned to this class yet.
            </div>
          )}
        </div>
      </div>
      
      {/* Students section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Students</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">{students.length} students</div>
            {isTeacher && (
              <button 
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="px-3 py-1.5 text-white rounded-lg transition-colors flex items-center gap-1.5"
                style={{ backgroundColor: '#1b68b3' }}
              >
                <UserPlus size={16} />
                Invite
              </button>
            )}
          </div>
        </div>
        
        {/* Invite form */}
        {isTeacher && showInviteForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 p-4 rounded-xl mb-4"
          >
            <form onSubmit={handleInvite} className="flex items-center gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter student email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b68b3] focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#145091] transition-colors"
              >
                Send Invite
              </button>
            </form>
          </motion.div>
        )}
        
        {/* Search bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search for students"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ backgroundColor: 'transparent' }}
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        {/* Students list */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {students.length > 0 ? (
            students.map((student, index) => (
              <div 
                key={student.id || index}
                className={`flex items-center justify-between p-4 ${
                  index !== students.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                    {student.name ? student.name.charAt(0) : 'S'}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail size={14} className="mr-1" />
                      {student.email}
                    </div>
                  </div>
                </div>
                
                {isTeacher && (
                  <button 
                    className="appearance-none border-none bg-transparent p-0 m-0 outline-none focus:outline-none focus:ring-0 active:ring-0 hover:bg-transparent"
                  >
                    <MoreVertical size={20} className="text-gray-500 hover:text-gray-700" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No students enrolled in this class yet.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PeopleTab;
