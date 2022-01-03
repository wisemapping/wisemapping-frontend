import { $assert } from '@wisemapping/core-js';
import IconModel from './IconModel';
import LinkModel from './LinkModel';
import NoteModel from './NoteModel';
import FeatureModel, { FeatureType } from './FeatureModel';


interface NodeById {
  id: FeatureType,
  model: typeof FeatureModel;
}

class FeatureModelFactory {
  static modelById: Array<NodeById> = [{
    id: 'icon',
    model: IconModel,
  }, {
    id: 'link',
    model: LinkModel,
  }, {
    id: 'note',
    model: NoteModel,
  }];

  static createModel(type: string, attributes): FeatureModel {
    $assert(type, 'type can not be null');
    $assert(attributes, 'attributes can not be null');

    const { model: Model } = FeatureModelFactory.modelById
      .filter((elem) => elem.id === type)[0];
    return new Model(attributes);
  }
  /**
     * @param id the feature metadata id
     * @return {Boolean} returns true if the given id is contained in the metadata array
     */
  static isSupported(type: string): boolean {
    return FeatureModelFactory.modelById.some((elem) => elem.id === type);
  }
};

export default FeatureModelFactory;
