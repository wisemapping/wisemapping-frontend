import beta2PelaMigrator from './Beta2PelaMigrator';
import modelCodeName from './ModelCodeName';
import pela2TangoMigrator from './Pela2TangoMigrator';
import xmlSerializerBeta from './XMLSerializer_Beta';
import xmlSerializerPela from './XMLSerializer_Pela';
import xmlSerializerTango from './XMLSerializer_Tango';
import xmlSerializerFactory from './XMLSerializerFactory';

export default {
  Beta2PelaMigrator: beta2PelaMigrator,
  ModelCodeName: modelCodeName,
  Pela2TangoMigrator: pela2TangoMigrator,
  XMLSerializer_Beta: xmlSerializerBeta,
  XMLSerializer_Pela: xmlSerializerPela,
  XMLSerializer_Tango: xmlSerializerTango,
  XMLSerializerFactory: xmlSerializerFactory,
};
