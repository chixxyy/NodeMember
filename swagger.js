const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "NodeMember API",
            version: "1.0.0",
            description: "API for user",
        },
        servers: [
            { url: "http://localhost:3000" }
        ],
    },
    apis: ["./server.js"],
};

const specs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, specs };
