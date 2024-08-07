export interface StorageItem {
  set(value: string | null): Promise<void>;
  get(): Promise<string | null>;
  remove(): Promise<void>;
}
