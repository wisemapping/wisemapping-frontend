const beta2PelaMigrator = require('./Beta2PelaMigrator').default;
const modelCodeName = require('./ModelCodeName').default;
const pela2TangoMigrator = require('./Pela2TangoMigrator').default;
const xmlSerializer_Beta = require('./XMLSerializer_Beta').default;
const xmlSerializer_Pela = require('./XMLSerializer_Pela').default;
const xmlSerializer_Tango = require('./XMLSerializer_Tango').default;
const xmlSerializerFactory = require('./XMLSerializerFactory').default;

export const Persistence = {
  Beta2PelaMigrator: beta2PelaMigrator,
  ModelCodeName: modelCodeName,
  Pela2TangoMigrator: pela2TangoMigrator,
  XMLSerializer_Beta: xmlSerializer_Beta,
  XMLSerializer_Pela: xmlSerializer_Pela,
  XMLSerializer_Tango: xmlSerializer_Tango,
  XMLSerializerFactory: xmlSerializerFactory,
};
