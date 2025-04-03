import * as React from "react";

interface Props {
  mainText?: string;
}

const Dots: React.FC<Props> = ({ mainText }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="flex space-x-2 justify-center items-center bg-primary/10 rounded-lg px-5 py-3">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
      </div>
      <div className="text-primary/80 font-medium">{mainText ?? "Loading"}...</div>
    </div>
  );
};

export default Dots;
