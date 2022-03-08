import Mindmap from '../model/Mindmap';

export default abstract class Importer {
    abstract import(nameMap: string, description: string): Promise<Mindmap>;
}
