import * as React from "react";

interface Props {
  children?: React.ReactNode;
}

const DataSidebar: React.FC<Props> = ({ children }) => {
  return (
    <div className="rounded-md w-full pt-14 left-0 h-screen border-r-0 items-start flex justify-center overflow-y-scroll">
      {children}
    </div>
  );
};

export default DataSidebar;
