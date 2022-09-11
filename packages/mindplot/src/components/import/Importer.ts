export default abstract class Importer {
  abstract import(nameMap: string, description: string): Promise<string>;
}
