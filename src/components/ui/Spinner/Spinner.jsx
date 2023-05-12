import React from 'react';

const Spinner = ({ size, className, ...props }) => {
  return (
    <div
      className={`${
        size === 'small' ? 'h-3.5 w-3.5 border-2' : 'h-8 w-8 border-4'
      } rounded-full border-t-transparent border-blue-600 animate-spin ${className}`}
      {...props}
    />
  );
};

export default Spinner;
