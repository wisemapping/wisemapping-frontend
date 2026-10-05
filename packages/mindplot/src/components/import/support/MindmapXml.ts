/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import xmlFormatter from 'xml-formatter';
import Mindmap from '../../model/Mindmap';
import XMLSerializerFactory from '../../persistence/XMLSerializerFactory';

/**
 * Serializes an imported map with the WiseMapping serializer, so that names, texts, notes and
 * colors read from the file are always escaped.
 */
const toWiseMappingXml = (mindmap: Mindmap): string => {
  const serializer = XMLSerializerFactory.createFromMindmap(mindmap);
  const xml = new XMLSerializer().serializeToString(serializer.toXML(mindmap));
  return xmlFormatter(xml, { indentation: '    ', collapseContent: true, lineSeparator: '\n' });
};

export default toWiseMappingXml;
