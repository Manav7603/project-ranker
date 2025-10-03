// File: lib/swagger.ts
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
        apiFolder: '../src/app/api', // define api folder, can be a string or an array of strings // define api folder, can be a string or an array of strings
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Project Ranker API',

        version: '1.0',
      },
      components: {
        // You can add security schemes here if needed
        // securitySchemes: {
        //   BearerAuth: {
        //     type: 'http',
        //     scheme: 'bearer',
        //     bearerFormat: 'JWT',
        //   },
        // },
      },
      security: [],
    },
  });
  return spec;
};