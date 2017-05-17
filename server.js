var express = require('express');
var app = express();
var Sequelize = require('sequelize');
var bodyParser = require('body-parser');
var async = require('async');
var swagger = require('swagger-tools');
var fs = require('fs');
var path = require('path');
var config = require('./config/config.json');

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var http = require('http').createServer(app);

app.set('port', process.env.PORT || config.port);

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

var LoadSwagger = () => {
    var root = require('./apis/swagger.json');
    var pathFile = path.join(__dirname, '/apis/paths');
    var pathfiles = fs.readdirSync(pathFile);
    pathfiles.forEach((file) => {
        var pathJson = require('./apis/paths/' + file);
        Object.keys(pathJson.paths)
            .forEach((path) => {
                root.paths[path] = pathJson.paths[path];
            });
    });
    var definitionFile = path.join(__dirname, '/apis/definitions');
    var definitionfiles = fs.readdirSync(definitionFile);
    definitionfiles.forEach((file) => {
        var definitionJson = require('./apis/definitions/' + file);
        Object.keys(definitionJson.definitions)
            .forEach((definition) => {
                root.definitions[definition] = definitionJson.definitions[definition];
            });
    });
    return root;
};

// swagger
var swaggerObj = LoadSwagger();

var options = {
    swaggerUi: '/swagger.json',
    controllers: __dirname + '/controllers'
};

swagger.initializeMiddleware(swaggerObj, (middleware) => {
    app.use(middleware.swaggerMetadata());
    app.use(middleware.swaggerSecurity({
        oauth2: function (req, def, scopes, callback) {
        // Do real stuff here
        }
    }));
    app.use(middleware.swaggerRouter(options));
    app.use(middleware.swaggerUi());
     // Serve the Swagger documents and Swagger UI
    //   http://localhost:3000/docs => Swagger UI
    //   http://localhost:3000/api-docs => Resource Listing JSON

    http.listen(app.get('port'),() => {
        console.log(`link: http://localhost:${app.get('port')}/api/... => Apis of DoraemonCare`);
        console.log(`link: http://localhost:${app.get('port')}/docs => Document Apis`);
        console.log(`link: http://localhost:${app.get('port')}/api-docs => Resource Listing JSON`)
    });
});

module.exports = app;