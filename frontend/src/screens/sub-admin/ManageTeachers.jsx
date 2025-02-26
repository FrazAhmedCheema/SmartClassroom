import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EntityManager from "../../components/sub-admin/EntityManager";

const ManageTeachers = () => {
  const [teachersData, setTeachersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch("http://localhost:8080/sub-admin/teachers", {
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch teachers");
        }
        const data = await response.json();
        const transformedData = data.data.map((teacher) => ({
          ...teacher,
          id: teacher.teacherId,
        }));
        setTeachersData(transformedData);
      } catch (error) {
        navigate('/sub-admin/login');
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1b68b3] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teachers data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#1b68b3] text-white rounded-lg hover:bg-[#154d85] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <EntityManager
            entityType="Teacher"
            initialEntities={teachersData}
            apiEndpoint="http://localhost:8080/sub-admin"
          />
        </motion.div>
      </motion.div>
    </main>
  );
};

export default ManageTeachers;

