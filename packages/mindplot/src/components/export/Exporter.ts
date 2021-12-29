import Mindmap from '../model/Mindmap';

interface Exporter {
    export(mindplot: Mindmap): string;
}

export default Exporter;