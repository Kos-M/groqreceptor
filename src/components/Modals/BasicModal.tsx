import * as React from "react";

interface Props {
  id: string;
  classname?: string;
  closeBtn?: React.ReactNode;
  children?: React.ReactNode;
}

const BasicModal: React.FC<Props> = ({ id, classname, closeBtn, children }) => {
  return (
    <dialog id={id} className="modal overflow-y-scroll">
      <div className={`${classname} modal-box `}>
        {children}
        <div className="modal-action">{closeBtn}</div>
      </div>
    </dialog>
  );
};

export default BasicModal;

{
  /* <button className="btn" onClick={()=>document.getElementById('my_modal_4').showModal()}>open modal</button> */
}
