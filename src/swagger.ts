import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Movie & Comments REST API",
      version: "1.0.0",
      description:
        "A REST API for managing posts and comments with user authentication",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Comment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            content: { type: "string" },
            postId: { type: "string" },
            sender: { type: "string" },
            __v: { type: "integer" },
          },
          required: ["content", "postId", "sender"],
        },
        NewComment: {
          type: "object",
          properties: {
            content: { type: "string" },
            postId: { type: "string" },
            sender: { type: "string" },
          },
          required: ["content", "postId", "sender"],
        },
      },
    },
    paths: {
      "/comment": {
        get: {
          summary: "Get all comments or filter by postId",
          parameters: [
            {
              in: "query",
              name: "postId",
              schema: { type: "string" },
              description: "Filter comments by the post ID",
            },
          ],
          responses: {
            200: {
              description: "A list of comments",
              content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Comment" } } } },
            },
            500: { description: "Server error" },
          },
        },
        post: {
          summary: "Create a new comment",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/NewComment" } } },
          },
          responses: {
            201: { description: "Created comment", content: { "application/json": { schema: { $ref: "#/components/schemas/Comment" } } } },
            500: { description: "Server error" },
          },
        },
      },
      "/comment/{id}": {
        get: {
          summary: "Get a comment by ID",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "A single comment", content: { "application/json": { schema: { $ref: "#/components/schemas/Comment" } } } },
            404: { description: "Comment not found" },
            500: { description: "Server error" },
          },
        },
        put: {
          summary: "Update a comment by ID",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/NewComment" } } } },
          responses: {
            200: { description: "The updated comment", content: { "application/json": { schema: { $ref: "#/components/schemas/Comment" } } } },
            404: { description: "Comment not found" },
            500: { description: "Server error" }
          },
        },
        delete: {
          summary: "Delete a comment by ID",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Deleted comment (or null if found)" },
            404: { description: "Comment not found" },
            500: { description: "Server error" }
          },
        },
      },
    },
  },
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    "./dist/src/routes/*.js",
    "./dist/src/controllers/*.js",
  ],
};

const specs = swaggerJsdoc(options);

export default specs;
