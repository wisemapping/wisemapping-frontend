import { $assert } from '@wisemapping/core-js';
import IconModel from './IconModel';
import LinkModel from './LinkModel';
import NoteModel from './NoteModel';

const FeatureModelFactory = {
  Icon: {
    id: IconModel.FEATURE_TYPE,
    model: IconModel,
  },

  Link: {
    id: LinkModel.FEATURE_TYPE,
    model: LinkModel,
  },

  /** the note object */
  Note: {
    id: NoteModel.FEATURE_TYPE,
    model: NoteModel,
  },

  createModel(type, attributes) {
    $assert(type, 'type can not be null');
    $assert(attributes, 'attributes can not be null');

    const { model: Model } = FeatureModelFactory._featuresMetadataById
      .filter((elem) => elem.id === type)[0];
    return new Model(attributes);
  },
  /**
     * @param id the feature metadata id
     * @return {Boolean} returns true if the given id is contained in the metadata array
     */
  isSupported(id) {
    return FeatureModelFactory._featuresMetadataById.some((elem) => elem.id === id);
  },
};

FeatureModelFactory._featuresMetadataById = [FeatureModelFactory.Icon, FeatureModelFactory.Link, FeatureModelFactory.Note];

export default FeatureModelFactory;
