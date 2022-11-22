import AppConfig from '../../classes/app-config';
import exampleMap from '../../classes/client/mock-client/example-map.wxml';
import {
  PersistenceManager,
  RESTPersistenceManager,
  LocalStorageManager,
  Mindmap,
  MockPersistenceManager,
  XMLSerializerFactory,
} from '@wisemapping/editor';

export const buildPersistenceManagerForEditor = (mode: string): PersistenceManager => {
  let persistenceManager: PersistenceManager;
  if (AppConfig.isRestClient()) {
    if (mode === 'edition-owner' || mode === 'edition-editor') {
      persistenceManager = new RESTPersistenceManager({
        documentUrl: '/c/restful/maps/{id}/document',
        revertUrl: '/c/restful/maps/{id}/history/latest',
        lockUrl: '/c/restful/maps/{id}/lock',
      });
    } else {
      persistenceManager = new LocalStorageManager(
        `/c/restful/maps/{id}/${
          globalThis.historyId ? `${globalThis.historyId}/` : ''
        }document/xml${mode === 'showcase' ? '-pub' : ''}`,
        true,
      );
    }
    persistenceManager.addErrorHandler((error) => {
      if (error.errorType === 'session-expired') {
        // TODO: this line was in RestPersistenceClient, do something similar here
        //client.sessionExpired();
      }
    });
  } else {
    persistenceManager = new MockPersistenceManager(exampleMap);
  }
  return persistenceManager;
};

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
