import { useEffect, useState, FC } from "react";

import {
  SettingsPanelProps,
  Parameter,
  Template,
  ParameterType,
} from "../../types/types"; // Import shared type
import { FaPencilAlt, FaPlusCircle, FaTrashAlt } from "react-icons/fa";
import BasicModal from "../Modals/BasicModal";
import {
  searchLocalStorageWithPrefix,
  setToLocalStorage,
  deleteItemsFromLocalStorage,
} from "../../utils/helper";

const SettingsPanel: FC<SettingsPanelProps> = ({
  onApiChange,
  apiValue,
  doGenerate,
  onTemplateChange,
}) => {
  const [params, setParams] = useState<Parameter[]>([]);

  const [existingTemplates, setExistingTemplates] = useState<Template[]>([]);

  const [paramName, setParamName] = useState<string>("");
  const [paramType, setParamType] = useState<ParameterType>("");
  const [templateName, setTemplateName] = useState<string>("");
  const [templatBody, setTemplatBody] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const getHeaders = (): string[] => {
    return ["Parameter Name", "Type"];
  };

  const isDisabledAddParamBtn = (): boolean => {
    let ans = false;
    if (paramName == "") ans = true;
    if (paramType == "") ans = true;

    return ans;
  };

  const isStoreBtnDisabled = (): boolean => {
    return templateName == "" || templatBody == "";
  };

  const AddParam = (): void => {
    setParams([
      ...params,
      {
        name: paramName,
        type: paramType,
      },
    ]);
  };

  const handleDelete = (index: number): void => {
    const newElements = [...params.slice(0, index), ...params.slice(index + 1)];
    setParams(newElements);
  };

  const saveTemplate = (): void => {
    const template: Template = {
      params: params,
      body: templatBody,
      name: templateName,
    };
    setToLocalStorage(
      `template_${templateName}`,
      JSON.stringify(template),
      true
    );
    setExistingTemplates([]);
    loadTemplates();
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = (): void => {
    const vals = searchLocalStorageWithPrefix("template_");
    const parsedTemps: Template[] = [];

    Object.keys(vals).forEach((template: string) => {
      parsedTemps.push(JSON.parse(JSON.parse(vals[template])));
    });
    setExistingTemplates(parsedTemps);
  };

  const newTemplateSelected = (
    evt: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    console.log(evt.target.value);
    const templateSelectedFOund: Template | undefined = existingTemplates.find(
      (item) => item.name === evt.target.value
    );
    if (templateSelectedFOund) {
      setSelectedTemplate(templateSelectedFOund);
      onTemplateChange?.call(null, templateSelectedFOund);
    }
  };

  const isEditBTNDisabled = (): boolean => {
    return selectedTemplate == null;
  };

  const showModal = () => {
    (
      document.getElementById("templateEditor") as HTMLDialogElement
    )?.showModal();
  };

  const loadTemplateForEdit = () => {
    if (!selectedTemplate) return;
    const sellectTempName = selectedTemplate.name;
    setSelectedTemplate(null);
    const templateSelectedFOund: Template | undefined = existingTemplates.find(
      (item) => item.name === sellectTempName
    );
    if (templateSelectedFOund) {
      setSelectedTemplate(templateSelectedFOund);
      // onTemplateChange?.call(null, templateSelectedFOund);
      setParams(templateSelectedFOund?.params);
      setTemplatBody(templateSelectedFOund.body);
      setTemplateName(templateSelectedFOund.name);
    }
    showModal();
  };

  const deleteSelectedTemplate = () => {
    if (!selectedTemplate) return;
    const vals = searchLocalStorageWithPrefix(
      `template_${selectedTemplate.name}`,
      true
    );
    if (Object.keys(vals).length > 0) {
      deleteItemsFromLocalStorage(vals);
      const paramsFound = searchLocalStorageWithPrefix(
        `__${selectedTemplate.name}__`,
        false
      );
      if (Object.keys(paramsFound).length > 0) {
        deleteItemsFromLocalStorage(paramsFound);
      }
      setSelectedTemplate(null);
      setExistingTemplates([]);
      loadTemplates();
    }
  };

  return (
    <div className="bg-transparent   rounded-md w-[270px] items-end mx-4">
      <div className="overflow-y-scroll ">
        <BasicModal
          id="templateEditor"
          classname="bg-opacity-40 overflow-y-scroll editorBgImg max-h-3/4 min-h-3/4 w-3/4 max-w-full relative bg-cover my-8"
          closeBtn={
            <form method="dialog" className="flex items-center  space-x-4">
              <label className="text-accent">
                Template Name
                <input
                  type="text"
                  value={templateName}
                  onChange={(evt) => setTemplateName(evt.target.value)}
                  className="input input-bordered my-2 w-full max-w-xs text-black dark:text-white"
                ></input>
              </label>
              <button
                disabled={isStoreBtnDisabled()}
                onClick={saveTemplate}
                className="btn btn-success mt-4"
              >
                Save
              </button>
            </form>
          }
        >
          <div className="flex overflow-y-scroll px-6 flex-col relative items-start justify-center w-full h-full   ">
            {/* Inputs */}
            <div className="flex py-4 space-x-4">
              <label className="text-accent">
                Parameter Name
                <input
                  type="text"
                  name="templateInputName"
                  onChange={(evt) => setParamName(evt.target.value)}
                  placeholder="Type here"
                  className="input input-bordered w-full text-black dark:text-white max-w-xs"
                />
              </label>
              <label className="text-accent">
                Parameter Type
                <select
                  onChange={(evt) =>
                    setParamType(evt.target.value as ParameterType)
                  }
                  value={paramType}
                  className="select select-primary text-black dark:text-white w-full max-w-xs"
                >
                  <option value="" disabled selected>
                    Select Type
                  </option>
                  <option value="Input">Input</option>
                  <option value="Output">Output</option>
                </select>
              </label>
              <label>
                <button
                  disabled={isDisabledAddParamBtn()}
                  onClick={AddParam}
                  className="btn btn-outline btn-success text-black dark:text-white w-full max-w-xs mt-6"
                >
                  Add Parameter
                </button>
              </label>
            </div>

            {/* Input Table */}
            <div className="flex items-center justify-center w-full text-white  ">
              <div className="overflow-x-auto w-full">
                <table className="table table-zebra">
                  {/* head */}
                  <thead>
                    <tr>
                      <th></th>
                      {getHeaders().map((header) => (
                        <th className="text-white">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* row 1 */}
                    {params.map((par, index) => (
                      <tr className="even:text-black dark:even:text-accent">
                        <th>{index + 1}</th>
                        <td>{par.name}</td>
                        <td>{par.type}</td>
                        <td>
                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => handleDelete(index)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col w-full h-full items-center justify-start ">
              <label className="w-full flex flex-col items-center justify-start">
                Template Body
                <textarea
                  style={{ background: "#002d2d" }}
                  onChange={(evt) => setTemplatBody(evt.target.value)}
                  // value={` Data:\n\nCandidate_CV : {{candidate_cv}}\n--\nCandidate_covers : {{candidate_covers}}\n--\nJob_LISTING: {{listing}}\n\n **Instructions**\n\n- You speak to the hiring manager (find his name in Job_LISTING if possible) as the Candidate.Pay close attention not to use HR company as the hiring company , sometimes in the listing they are reffer also the hr company info.\n- Combination of Data: Merge role description and existing cover letters to create the final cover letter.\n- Candidate CV Data: Utilize the Candidate CV data for signing off the letter or as needed, when the hiring company is unclear, minimize company references in the cover letter.\n- Accuracy and Authenticity: Only include projects and details that exist in the provided data. Avoid fabricating information.\n- Tone and Style: Maintain a friendly, formal tone, showcasing excitement and enthusiasm for the target company.\n- Confidence and Humility: Balance humility with ownership of past projects and experiences.\n- Promotion and Justification: Highlight the candidate's strengths and reasons why they should be hired by the target company.\n- Conciseness and Clarity: Ensure the final cover letter is clear, concise, and within the 250-word limit.\n- Response Format: Always respond in JSON format.\n- Optional Job Listing Details: While not required, incorporating job listing details can help communicate the candidate's skills.\n- Cover Letter Title: Include a coverTitle key in the JSON response with a short title in the format: [job listing title] Cover Letter - [Company Name].\n- Response Format: { coverTitle: \"<title here>\", coverLetter:\"<letter here>\" }\n- Append at the end the hiring company info on a new section.`}
                  value={templatBody}
                  className="textarea relative  w-2/3 h-72 debug my-2  mix-blend-lighten"
                ></textarea>
              </label>
            </div>
          </div>
        </BasicModal>
      </div>
      <div className="drawer lg:drawer-open h-screen">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          {/* Page content here */}
          {/* <label
            htmlFor="my-drawer-2"
            className="btn btn-warning drawer-button lg:hidden"
          >
            Open drawer
          </label> */}
        </div>
        <div className="drawer-side min-h-screen -mt-[56px]">
          {/* <label
            htmlFor="my-drawer-2"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label> */}
          <div className="menu  bg-base-200 text-base-content min-h-screen  pt-[120px] justify-arround w-full flex flex-col flex-grow space-y-2 justify-evenly">
            <div className="w-[270px] flex flex-col space-y-8">
              <label htmlFor="apiKey">
                Groq Api Key
                <input
                  id="apiKey"
                  type="text"
                  value={apiValue}
                  onInput={onApiChange}
                  placeholder="Api Key"
                  className="input input-bordered input-primary w-full max-w-xs mt-2"
                />
              </label>

              <section className="flex flex-col">
                <label className="flex flex-col">
                  Template
                  <div className="inline-flex space-x-4 py-2">
                    <select
                      onChange={newTemplateSelected}
                      className="select select-info w-3/4 "
                    >
                      <option disabled selected>
                        Select Template
                      </option>
                      {existingTemplates.map((temp: Template) => (
                        <option value={temp.name}>{temp.name}</option>
                      ))}
                    </select>
                  </div>
                </label>
                <div className="flex space-x-2">
                  {/* Add New */}
                  <button
                    className="btn btn-success bg-opacity-70"
                    onClick={() => {
                      setParams([]);
                      setTemplatBody("");
                      setTemplateName("");
                      showModal();
                    }}
                  >
                    <FaPlusCircle />
                  </button>
                  {/* Edit */}
                  <button
                    className="btn btn-warning bg-opacity-70"
                    disabled={isEditBTNDisabled()}
                    onClick={loadTemplateForEdit}
                  >
                    <FaPencilAlt />
                  </button>
                  {/* Delete */}
                  <button
                    className="btn btn-error bg-opacity-70"
                    disabled={isEditBTNDisabled()}
                    onClick={deleteSelectedTemplate}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </section>
            </div>
            {/* Bottom Generate button */}
            <div className=" justify-center flex pb-48">
              <button
                onClick={() => doGenerate?.call(null, selectedTemplate)}
                className="btn btn-circle bg-primary flex items-center justify-center w-24 h-24 rounded-full hover:bg-blue-700 text-white"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
