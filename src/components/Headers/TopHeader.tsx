import * as React from "react";

const TopHeader: React.FC = () => {
  return (
    <div className="z-50 w-full h-14 fixed top-0 left-0 flex items-center justify-center md:justify-start px-4 bg-base-200 bg-opacity-70 backdrop-blur-sm border-b border-gray-700">
      <h1 className="text-xl md:text-2xl font-bold text-primary">Groq Receptor</h1>
    </div>
  );
};

export default TopHeader;
