// type chatTemplates = Record<string, Promise<string>> | string;
type chatTemplates = Record<string, Promise<string>> & { [key: string]: any };