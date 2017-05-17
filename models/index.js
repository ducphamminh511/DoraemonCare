var Sequelize = require('sequelize');
var fs = require('fs');
var data = fs.readFileSync('config/config.json');
var path = require('path');
var lodash = require('lodash');
var db = {};

// parse Json to Object
var databaseConfig = JSON.parse(data.toString());
var database = databaseConfig.database;

//sequelize
var sequelize = new Sequelize(database.dbname, database.username, database.password, {
  host: database.host,
  dialect: database.dialect,

  pool: {
    max: database.max,
    min: database.min,
    idle: database.idles
  },

  // SQLite only
  //storage: 'http://localhost/phpmyadmin/to/database.sqlite'
});

fs.readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file != 'index.js')
  })
  .forEach((file) => {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  })

  Object.keys(db).forEach((modelName) => {
    if(db[modelName].options.hasOwnProperty('associate')) {
      db[modelName].options.associate(db)
    }
  })

module.exports = lodash.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db)