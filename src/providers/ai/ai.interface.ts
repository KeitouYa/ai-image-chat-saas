export interface AIProvider {
  chat(message: string): Promise<string>;
}
