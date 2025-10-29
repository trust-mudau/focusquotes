export interface Quote {
  id: string;
  text: string;
  url: string;
  savedAt: number;
}

export interface Settings {
  highlightEnabled: boolean;
  storageMode: "local" | "sync";
}
