import * as React from "react";

interface Props {
  id: string;
  classname?: string;
  closeBtn?: React.ReactNode;
  children?: React.ReactNode;
  showTopRightClose?: boolean;
  onClose?: () => void;
}

const BasicModal: React.FC<Props> = ({ 
  id, 
  classname, 
  closeBtn, 
  children, 
  showTopRightClose = false,
  onClose
}) => {
  return (
    <dialog id={id} className="modal overflow-y-scroll backdrop-blur-sm">
      <div className={`${classname} modal-box shadow-xl rounded-lg border border-base-300/30 relative`}>
        {showTopRightClose && (
          <button 
            onClick={onClose} 
            className="btn btn-sm btn-circle absolute right-2 top-2 z-20"
            aria-label="Close"
          >
            ✕
          </button>
        )}
        {children}
        {!showTopRightClose && <div className="modal-action">{closeBtn}</div>}
      </div>
    </dialog>
  );
};

export default BasicModal;

{
  /* <button className="btn" onClick={()=>document.getElementById('my_modal_4').showModal()}>open modal</button> */
}
