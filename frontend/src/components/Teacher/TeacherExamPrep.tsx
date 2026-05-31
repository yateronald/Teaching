import React from 'react';
import ExamResultsDashboard from '../Common/ExamResultsDashboard';

const TeacherExamPrep: React.FC = () => {
  return (
    <div style={{ padding: '0px 0px 32px' }}>
      <ExamResultsDashboard mode="teacher" />
    </div>
  );
};

export default TeacherExamPrep;
