export type GenericEvent = {
  target: {
    value: string;
  };
};
export type SettingsPanelProps = {
  onApiChange?: (message: React.ChangeEvent<HTMLInputElement>) => void,
  apiValue?: string;
  doGenerate?: (activeTemplate: Template | null)=> void
  onTemplateChange?:(activeTemplate: Template)=> void
  isMobile?: boolean;
  apiKeyValid?: boolean | null;
  validatingApi?: boolean;
  error?: string;
  onErrorDismiss?: () => void;
};

export type ChatResponseType = {
  isInProgress: boolean;
  chatResponse?:string  ;
   children?:  { [key: string]: string }[]//React.ReactNode[];
}

// export type chatTemplates = Record<string, Promise<string>> & { [key: string]: any };
export type ParameterType = 'Input' | 'Output'| '';

export interface Parameter {
  name: string;
  type: ParameterType
}

export interface Template {
  params: Parameter[];
  body: string;
  name: string;
}