import React from 'react';

const SectionSkeletonWrapper = ({ children, className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
};

export default SectionSkeletonWrapper;
