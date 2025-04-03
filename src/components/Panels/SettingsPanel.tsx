import { useEffect, useState, FC } from "react";

import {
  SettingsPanelProps,
  Parameter,
  Template,
  ParameterType,
} from "../../types/types"; // Import shared type
import { FaPencilAlt, FaPlusCircle, FaTrashAlt, FaCheckCircle, FaTimesCircle, FaSpinner, FaKeyboard, FaFileImport, FaFileExport, FaCog, FaKey, FaCode, FaList, FaInfoCircle } from "react-icons/fa";
import BasicModal from "../Modals/BasicModal";
import ErrorMessage from "../Feedback/ErrorMessage";
import {
  searchLocalStorageWithPrefix,
  setToLocalStorage,
  deleteItemsFromLocalStorage,
} from "../../utils/helper";

// CSS for toast animations
const toastAnimationCSS = `
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.animate-slide-in {
  animation: slideIn 0.3s ease forwards;
}

.animate-fade-out {
  animation: fadeOut 0.5s ease-out forwards;
}

@keyframes highlight {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.highlight-pulse {
  animation: highlight 1s ease-in-out;
}
`;

// Toast types for different notifications
type ToastType = 'success' | 'error' | 'info' | 'warning';

// Interface for toast notification
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const SettingsPanel: FC<SettingsPanelProps> = ({
  onApiChange,
  apiValue,
  doGenerate,
  onTemplateChange,
  isMobile = false,
  apiKeyValid = null,
  validatingApi = false,
  error = "",
  onErrorDismiss,
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
  const [showInsertSuccess, setShowInsertSuccess] = useState(false);
  
  // Toast notification state
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Add state for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  // Add state for template selection highlight
  const [highlightTemplate, setHighlightTemplate] = useState(false);

  // Function to add a toast notification
  const addToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const getHeaders = (): string[] => {
    return ["Parameter Name", "Type"];
  };

  const isDisabledAddParamBtn = (): boolean => {
    return paramName === "" || paramType === "";
  };

  const isStoreBtnDisabled = (): boolean => {
    return templateName === "" || templatBody === "";
  };

  const isGenerateDisabled = (): boolean => {
    return !selectedTemplate || !apiKeyValid;
  };

  const AddParam = (): void => {
    setParams([
      ...params,
      {
        name: paramName,
        type: paramType,
      },
    ]);
    setParamName("");
    addToast(`Parameter "${paramName}" added`, 'success');
  };

  const handleDelete = (index: number): void => {
    const paramToDelete = params[index];
    const newElements = [...params.slice(0, index), ...params.slice(index + 1)];
    setParams(newElements);
    addToast(`Parameter "${paramToDelete.name}" removed`, 'info');
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
    closeModal();
    addToast(`Template "${templateName}" saved successfully`, 'success');
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Add effect to show toast when API key validation changes
  useEffect(() => {
    if (apiKeyValid === true) {
      addToast('API key validated successfully', 'success');
    } else if (apiKeyValid === false) {
      addToast('API key validation failed', 'error');
    }
  }, [apiKeyValid]);

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
    const templateSelectedFound: Template | undefined = existingTemplates.find(
      (item) => item.name === evt.target.value
    );
    if (templateSelectedFound) {
      setSelectedTemplate(templateSelectedFound);
      onTemplateChange?.call(null, templateSelectedFound);
      addToast(`Template "${templateSelectedFound.name}" selected`, 'info');
      
      // Trigger highlight animation
      setHighlightTemplate(true);
      setTimeout(() => setHighlightTemplate(false), 1000);
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

  const closeModal = () => {
    (
      document.getElementById("templateEditor") as HTMLDialogElement
    )?.close();
  };

  const loadTemplateForEdit = () => {
    if (!selectedTemplate) return;
    const sellectTempName = selectedTemplate.name;
    setSelectedTemplate(null);
    const templateSelectedFound: Template | undefined = existingTemplates.find(
      (item) => item.name === sellectTempName
    );
    if (templateSelectedFound) {
      setSelectedTemplate(templateSelectedFound);
      setParams(templateSelectedFound?.params);
      setTemplatBody(templateSelectedFound.body);
      setTemplateName(templateSelectedFound.name);
      addToast(`Editing template "${templateSelectedFound.name}"`, 'info');
    }
    showModal();
  };

  const deleteSelectedTemplate = () => {
    if (!templateToDelete) return;
    
    const templateNameToDelete = templateToDelete.name;
    const vals = searchLocalStorageWithPrefix(
      `template_${templateToDelete.name}`,
      true
    );
    if (Object.keys(vals).length > 0) {
      deleteItemsFromLocalStorage(vals);
      const paramsFound = searchLocalStorageWithPrefix(
        `__${templateToDelete.name}__`,
        false
      );
      if (Object.keys(paramsFound).length > 0) {
        deleteItemsFromLocalStorage(paramsFound);
      }
      setSelectedTemplate(null);
      setExistingTemplates([]);
      loadTemplates();
      addToast(`Template "${templateNameToDelete}" deleted`, 'warning');
      
      // Select next available template after a short delay to ensure templates are loaded
      setTimeout(() => {
        const updatedTemplates = searchLocalStorageWithPrefix("template_");
        const parsedTemps: Template[] = [];
        
        Object.keys(updatedTemplates).forEach((template: string) => {
          parsedTemps.push(JSON.parse(JSON.parse(updatedTemplates[template])));
        });
        
        if (parsedTemps.length > 0) {
          setSelectedTemplate(parsedTemps[0]);
          onTemplateChange?.call(null, parsedTemps[0]);
          addToast(`Selected template "${parsedTemps[0].name}"`, 'info');
        }
      }, 100);
    }
    
    // Close the confirmation dialog
    setShowDeleteConfirm(false);
    setTemplateToDelete(null);
  };
  
  // Show delete confirmation dialog
  const confirmDeleteTemplate = () => {
    if (!selectedTemplate) return;
    setTemplateToDelete(selectedTemplate);
    setShowDeleteConfirm(true);
  };

  // Cancel delete operation
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTemplateToDelete(null);
  };

  // API key status indicator component
  const ApiKeyStatusIndicator = () => {
    if (validatingApi) {
      return (
        <div className="flex items-center text-blue-400 mt-1">
          <FaSpinner className="animate-spin mr-2" />
          <span className="text-sm">Validating API key...</span>
        </div>
      );
    } else if (apiKeyValid === true) {
      return (
        <div className="flex items-center text-green-500 mt-1">
          <FaCheckCircle className="mr-2" />
          <span className="text-sm">API key valid</span>
        </div>
      );
    } else if (apiKeyValid === false) {
      return (
        <div className="flex items-center text-red-500 mt-1">
          <FaTimesCircle className="mr-2" />
          <span className="text-sm">Invalid API key</span>
        </div>
      );
    }
    return null;
  };

  // Handle parameter insertion
  const insertParameter = (paramName: string) => {
    const cursorPosition = (document.querySelector('.template-body') as HTMLTextAreaElement)?.selectionStart || 0;
    const textBefore = templatBody.substring(0, cursorPosition);
    const textAfter = templatBody.substring(cursorPosition);
    const newText = `${textBefore}{{${paramName}}}${textAfter}`;
    setTemplatBody(newText);
    
    // Show success message
    setShowInsertSuccess(true);
    setTimeout(() => setShowInsertSuccess(false), 2000);
  };

  // Export templates
  const exportTemplates = () => {
    if (existingTemplates.length === 0) {
      addToast('No templates to export', 'warning');
      return;
    }
    
    const templates = existingTemplates;
    const jsonString = JSON.stringify(templates, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addToast(`${templates.length} templates exported successfully`, 'success');
  };

  // Import templates
  const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const templates = JSON.parse(e.target?.result as string) as Template[];
        
        // Validate templates structure
        if (!Array.isArray(templates)) {
          throw new Error('Invalid template format');
        }

        let importCount = 0;
        
        // Save each template to localStorage
        templates.forEach(template => {
          if (template.name && template.params && template.body) {
            setToLocalStorage(
              `template_${template.name}`,
              JSON.stringify(template),
              true
            );
            importCount++;
          }
        });

        // Reload templates
        setExistingTemplates([]);
        loadTemplates();
        
        addToast(`${importCount} templates imported successfully`, 'success');
        
        // Clear the file input
        event.target.value = '';
      } catch (error) {
        console.error('Error importing templates:', error);
        addToast('Error importing templates. Please check the file format.', 'error');
        
        // Clear the file input
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Warning message component
  const WarningMessage = ({ message }: { message: string }) => {
    if (!message) return null;
    
    return (
      <div className="alert alert-warning shadow-md text-sm py-2 my-3">
        <FaInfoCircle className="mr-2" />
        <p>{message}</p>
      </div>
    );
  };

  // Handle generate with feedback
  const handleGenerate = () => {
    if (selectedTemplate) {
      doGenerate?.call(null, selectedTemplate);
      addToast(`Generating with template "${selectedTemplate.name}"`, 'info');
    }
  };

  // Toast notification component
  const ToastContainer = () => {
    if (toasts.length === 0) return null;
    
    return (
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`alert shadow-lg p-2 text-sm min-w-[250px] max-w-xs animate-slide-in ${
              toast.type === 'success' ? 'alert-success' :
              toast.type === 'error' ? 'alert-error' :
              toast.type === 'warning' ? 'alert-warning' : 'alert-info'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <FaCheckCircle className="flex-none" />}
              {toast.type === 'error' && <FaTimesCircle className="flex-none" />}
              {toast.type === 'info' && <FaInfoCircle className="flex-none" />}
              {toast.type === 'warning' && <FaInfoCircle className="flex-none" />}
              <span>{toast.message}</span>
              <button 
                className="btn btn-ghost btn-xs"
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              >
                <FaTimesCircle size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => {
    if (!showDeleteConfirm || !templateToDelete) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-base-100 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-slide-in">
          <h3 className="text-lg font-bold text-error mb-4 flex items-center gap-2">
            <FaTrashAlt className="text-error" />
            Confirm Delete
          </h3>
          <p className="mb-6 text-sm">
            Are you sure you want to delete the template "{templateToDelete.name}"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={cancelDelete}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={deleteSelectedTemplate}
              className="btn btn-sm btn-error"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-transparent h-full overflow-hidden ${isMobile ? 'w-full px-2' : 'w-[350px]'}`}>
      <div className="h-full overflow-y-auto py-4 px-2">
        {/* Toast Notifications */}
        <ToastContainer />
        
        {/* CSS for animations */}
        <style>{toastAnimationCSS}</style>
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal />
        
        <BasicModal
          id="templateEditor"
          classname={`bg-opacity-40 overflow-y-auto editorBgImg max-h-[90vh] min-h-[80vh] ${isMobile ? 'w-[95%]' : 'w-[90%]'} max-w-full relative bg-cover my-8`}
          closeBtn={null}
          showTopRightClose={true}
          onClose={closeModal}
        >
          <div className="flex flex-col w-full h-full">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-base-100/90 backdrop-blur-sm border-b border-base-300 p-4 shadow-md rounded-t-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center gap-2">
                  <FaCode className="text-primary text-lg" />
                  <h2 className="text-xl font-bold text-primary">Template Editor</h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-accent text-sm whitespace-nowrap">Template Name:</label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(evt) => setTemplateName(evt.target.value)}
                      placeholder="Enter template name"
                      className="input input-bordered input-sm w-full sm:w-48 text-black dark:text-white shadow-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end sm:justify-start">
                    <button
                      disabled={isStoreBtnDisabled()}
                      onClick={saveTemplate}
                      className="btn btn-sm btn-success gap-2 shadow-sm hover:shadow-md transition-all"
                    >
                      <FaCheckCircle size={14} />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-6 p-4 sm:p-6">
              {/* Left Column - Parameters */}
              <div className="w-full md:w-1/3">
                <div className="bg-base-100/70 rounded-lg shadow-lg p-4 mb-4 sm:mb-6">
                  <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                    <FaPlusCircle className="text-primary" />
                    <span>Add Parameters</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-accent text-sm font-medium">Parameter Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter parameter name"
                        className="input input-bordered input-sm w-full text-black dark:text-white shadow-sm"
                        value={paramName}
                        onChange={(evt) => setParamName(evt.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-accent text-sm font-medium">Parameter Type</span>
                      </label>
                      <select
                        className="select select-bordered select-sm w-full text-black dark:text-white shadow-sm"
                        value={paramType}
                        onChange={(evt) =>
                          setParamType(evt.target.value as ParameterType)
                        }
                      >
                        <option disabled value="">
                          Select parameter type
                        </option>
                        <option value="Input">Input</option>
                        <option value="Output">Output</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-sm btn-primary w-full shadow-sm hover:shadow-md transition-all"
                      onClick={AddParam}
                      disabled={isDisabledAddParamBtn()}
                    >
                      Add Parameter
                    </button>
                  </div>
                </div>

                <div className="bg-base-100/70 rounded-lg shadow-lg p-4">
                  <h3 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
                    <FaList className="text-primary" />
                    <span>Parameters List</span>
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {params.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm italic">
                        No parameters added yet
                      </div>
                    )}
                    {params.map((par, index) => (
                      <div key={index} className="flex flex-wrap items-center justify-between p-2 bg-base-300/30 rounded-lg hover:bg-base-300/50 transition-colors group shadow-sm">
                        <div className="flex items-center gap-2 mb-1 sm:mb-0">
                          <span className={`badge badge-sm ${par.type === 'Input' ? 'badge-primary' : 'badge-secondary'} shadow-sm`}>
                            {par.type}
                          </span>
                          <span className="font-mono text-sm">{par.name}</span>
                        </div>
                        <div className="flex gap-1 w-full sm:w-auto justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                          {par.type === 'Input' && (
                            <button
                              className="btn btn-xs btn-primary btn-outline shadow-sm"
                              onClick={() => insertParameter(par.name)}
                              title="Insert into template"
                            >
                              Insert
                            </button>
                          )}
                          <button
                            className="btn btn-xs btn-error btn-outline shadow-sm"
                            onClick={() => handleDelete(index)}
                            title="Delete parameter"
                          >
                            <FaTrashAlt size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Template Body */}
              <div className="w-full md:w-2/3">
                <div className="bg-base-100/70 rounded-lg p-4 shadow-lg h-full">
                  <h3 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
                    <FaCode className="text-primary" />
                    <span>Template Body</span>
                  </h3>
                  <div className="flex flex-col h-full">
                    <div className="flex-1 relative">
                      <textarea
                        className="template-body textarea textarea-bordered w-full h-full min-h-[400px] text-black dark:text-white font-mono text-sm shadow-inner rounded-lg"
                        placeholder="Write your template body here..."
                        value={templatBody}
                        onChange={(evt) => setTemplatBody(evt.target.value)}
                      ></textarea>
                      {showInsertSuccess && (
                        <div className="absolute top-4 right-4 bg-success text-success-content px-3 py-1 rounded-md shadow-md animate-fade-out text-sm">
                          Parameter inserted!
                        </div>
                      )}
                    </div>
                    <div className="mt-3 p-3 bg-base-300/40 rounded-lg shadow-sm">
                      <h4 className="font-bold text-xs text-accent mb-1">QUICK TIPS:</h4>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Click "Insert" next to any input parameter to add it to your template</li>
                        <li>• Use Handlebars syntax (&#123;&#123;variable&#125;&#125;) to reference parameters</li>
                        <li>• Input parameters will be replaced with actual values when generating</li>
                        <li>• Output parameters will store the generated results</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BasicModal>

        <div className="flex flex-col justify-start items-center h-full overflow-y-auto space-y-5">
          {/* API Key Section */}
          <section className="w-full bg-base-200/30 p-4 rounded-lg shadow-sm">
            <h3 className="font-bold text-base text-primary mb-3 flex items-center gap-2">
              <FaKey className="text-primary" />
              <span>API Key</span>
            </h3>
            <div className="flex flex-col space-y-1">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your Groq Receptor API Key"
                  value={apiValue}
                  onChange={(e) => {
                    onApiChange?.(e);
                    if (e.target.value && !apiValue) {
                      addToast('API key entered, validating...', 'info');
                    }
                  }}
                  className="input input-bordered input-sm w-full pr-10 text-black dark:text-white shadow-sm"
                />
              </div>
              <ApiKeyStatusIndicator />
            </div>
          </section>

          {/* Templates Section */}
          <section className="w-full bg-base-200/30 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-primary flex items-center gap-2">
                <FaCog className="text-primary" />
                <span>Templates</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportTemplates}
                  disabled={existingTemplates.length === 0}
                  className="btn btn-xs btn-secondary shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1 tooltip tooltip-left"
                  data-tip="Export all templates to file"
                >
                  <FaFileExport size={10} />
                  <span>Export All</span>
                </button>
                <label className="btn btn-xs btn-primary shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer tooltip tooltip-left"
                  data-tip="Import templates from file">
                  <FaFileImport size={10} />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importTemplates}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <select
                  className={`select select-bordered select-sm w-full text-black dark:text-white shadow-sm bg-base-200 ${highlightTemplate ? 'highlight-pulse' : ''}`}
                  onChange={newTemplateSelected}
                  value={selectedTemplate?.name || ""}
                >
                  <option disabled value="">
                    Choose a template...
                  </option>
                  {existingTemplates.map((template) => (
                    <option key={template.name} value={template.name}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-between">
                <button
                  onClick={() => {
                    // Reset form fields when creating a new template
                    setTemplateName("");
                    setTemplatBody("");
                    setParams([]);
                    showModal();
                    addToast('Creating a new template', 'info');
                  }}
                  className="btn btn-sm btn-success shadow-sm hover:shadow-md transition-all flex-1 flex items-center justify-center gap-1"
                >
                  <FaPlusCircle size={12} />
                  <span>New</span>
                </button>
                <button
                  onClick={loadTemplateForEdit}
                  disabled={isEditBTNDisabled()}
                  className="btn btn-sm btn-info shadow-sm hover:shadow-md transition-all flex-1 flex items-center justify-center gap-1"
                >
                  <FaPencilAlt size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={confirmDeleteTemplate}
                  disabled={isEditBTNDisabled()}
                  className="btn btn-sm btn-error shadow-sm hover:shadow-md transition-all flex-1 flex items-center justify-center gap-1"
                >
                  <FaTrashAlt size={12} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </section>

          {/* Generate Button */}
          <div className="w-full">
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled()}
              className={`btn btn-primary w-full btn-md shadow-md hover:shadow-lg transition-all ${isGenerateDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Generate
            </button>
          </div>

          {/* Messages */}
          <>
            <ErrorMessage message={error} onDismiss={onErrorDismiss} />
            {!apiKeyValid && apiValue === "" && (
              <WarningMessage message="Please enter your Groq Receptor API key to get started." />
            )}
          </>

          {/* Selected Template Info */}
          {selectedTemplate && (
            <div className="w-full bg-base-200/30 p-4 rounded-lg shadow-md space-y-3">
              <div>
                <h3 className="font-bold text-xs text-accent uppercase mb-1 flex items-center gap-1">
                  <FaCog size={10} />
                  Active Template
                </h3>
                <p className="text-primary font-bold text-sm">{selectedTemplate.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-xs text-accent uppercase mb-1 flex items-center gap-1">
                    <FaKeyboard size={10} />
                    Input Parameters
                  </h3>
                  {selectedTemplate.params.filter(p => p.type === "Input").length === 0 ? (
                    <p className="text-gray-400 italic text-xs">None defined</p>
                  ) : (
                    <ul className="list-disc pl-4 space-y-1">
                      {selectedTemplate.params
                        .filter((param) => param.type === "Input")
                        .map((param, index) => (
                          <li key={index} className="text-gray-300 text-sm">{param.name}</li>
                        ))}
                    </ul>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-xs text-accent uppercase mb-1 flex items-center gap-1">
                    <FaKeyboard size={10} />
                    Output Parameters
                  </h3>
                  {selectedTemplate.params.filter(p => p.type === "Output").length === 0 ? (
                    <p className="text-gray-400 italic text-xs">None defined</p>
                  ) : (
                    <ul className="list-disc pl-4 space-y-1">
                      {selectedTemplate.params
                        .filter((param) => param.type === "Output")
                        .map((param, index) => (
                          <li key={index} className="text-gray-300 text-sm">{param.name}</li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
