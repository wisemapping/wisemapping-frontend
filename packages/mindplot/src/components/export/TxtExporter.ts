/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { Mindmap } from "../..";
import INodeModel from "../model/INodeModel";
import LinkModel from "../model/LinkModel";
import Exporter from "./Exporter";

class TxtExporter implements Exporter {
    private mindmap: Mindmap;

    constructor(mindmap: Mindmap) {
        this.mindmap = mindmap;
    }

    extension(): string {
        return 'txt';
    }

    export(): Promise<string> {
        const mindmap = this.mindmap;

        const branches = mindmap.getBranches();
        const retult = this.traverseBranch('', branches);
        return Promise.resolve(retult);
    }

    private traverseBranch(prefix: string, branches: Array<INodeModel>) {
        let result = '';
        branches.forEach((node, index) => {
            result = result + `${prefix}${index+1} ${node.getText()}`;
            node.getFeatures().forEach((f)=>{
                const type = f.getType();
                if(type === 'link'){
                    result = result + ` [link: ${(f as LinkModel).getUrl()}]`
                }    
            });
            result = result + '\n';

            if (node.getChildren().length > 0) {
                result = result + this.traverseBranch(`\t${prefix}${index+1}.`, node.getChildren());
            }
        });
        return result;
    }


}
export default TxtExporter;