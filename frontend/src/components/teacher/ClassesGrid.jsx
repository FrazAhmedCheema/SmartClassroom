import React from 'react';
import ClassCard from './ClassCard';

const ClassesGrid = ({ classes = [] }) => {
  console.log('Rendering ClassesGrid with classes:', classes);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((classItem) => (
        <ClassCard key={classItem._id} classData={classItem} />
      ))}
    </div>
  );
};

export default ClassesGrid;
