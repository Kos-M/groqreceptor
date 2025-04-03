import * as React from "react";

interface Props {
  children?: React.ReactNode;
}

const DataSidebar: React.FC<Props> = ({ children }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-full overflow-y-auto custom-scrollbar px-2 pt-16 pb-8">
        {children}
      </div>
    </div>
  );
};

export default DataSidebar;
