import * as React from "react";

interface Props {
  mainText?: string;
}

const Dots: React.FC<Props> = ({ mainText }) => {
  return (
    <div className="flex items-center gap-2 text-gray-700 bg-gray-300 p-2 rounded-lg shadow-sm">
      <span className="animate-pulse">•</span>
      <span className="animate-pulse delay-150">•</span>
      <span className="animate-pulse delay-300">•</span>
      <span>{mainText ?? "Typing"}...</span>
    </div>
  );
};

export default Dots;
