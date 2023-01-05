import AppConfig from '../../classes/app-config';
import { LocalStorageManager, Mindmap, XMLSerializerFactory } from '@wisemapping/editor';

export const fetchMindmap = async (mapId: number): Promise<Mindmap> => {
  let mindmap: Mindmap;
  if (AppConfig.isRestClient()) {
    const persistence = new LocalStorageManager(`/c/restful/maps/{id}/document/xml`, true);
    mindmap = await persistence.load(String(mapId));
  } else {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(
      `
				<map name="${mapId}" version="tango">
					<topic central="true" text="This is the map ${mapId}" id="1" fontStyle=";;#ffffff;;;"></topic>
				</map>
				`,
      'text/xml',
    );

    const serializer = XMLSerializerFactory.getSerializer('tango');
    mindmap = Promise.resolve(serializer.loadFromDom(xmlDoc, String(mapId)));
  }
  return mindmap;
};
