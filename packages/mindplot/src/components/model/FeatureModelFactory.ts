import { $assert } from '@wisemapping/core-js';
import IconModel from './IconModel';
import LinkModel from './LinkModel';
import NoteModel from './NoteModel';
import FeatureModel from './FeatureModel';

class FeatureModelFactory {

  private static modelById = [{
    id: IconModel.FEATURE_TYPE,
    model: IconModel,
  }, {
    id: LinkModel.FEATURE_TYPE,
    model: LinkModel,
  }, {
    id: NoteModel.FEATURE_TYPE,
    model: NoteModel,
  }] as const;

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
