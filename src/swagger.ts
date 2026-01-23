import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Posts & Comments API",
      version: "1.0.0",
      description: "API for managing posts, comments, and user authentication",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    paths: {
      "/auth/register": {
        post: {
          summary: "Register a new user",
          description: "Create a new user account with email and password",
          tags: ["Authentication"],
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterRequest",
                },
              },
            },
          },
          responses: {
            201: {
              description: "User successfully registered",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/TokensResponse",
                  },
                },
              },
            },
            401: {
              $ref: "#/components/responses/UnauthorizedError",
            },
            400: {
              $ref: "#/components/responses/ValidationError",
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
      },
      "/auth/login": {
        post: {
          summary: "User login",
          description: "Authenticate user with email and password",
          tags: ["Authentication"],
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "User successfully authenticated",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/TokensResponse",
                  },
                },
              },
            },
            400: {
              $ref: "#/components/responses/ValidationError",
            },
            401: {
              $ref: "#/components/responses/UnauthorizedError",
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
      },
      "/auth/refresh-token": {
        post: {
          summary: "Refresh access token",
          description:
            "Generate new access and refresh tokens using a valid refresh token",
          tags: ["Authentication"],
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RefreshTokenRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Tokens successfully refreshed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/TokensResponse",
                  },
                },
              },
            },
            401: {
              $ref: "#/components/responses/UnauthorizedError",
            },
            400: {
              $ref: "#/components/responses/ValidationError",
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
      },
      "/post": {
        get: {
          summary: "Get all posts",
          description: "Retrieve a list of all posts",
          tags: ["Posts"],
          security: [],
          responses: {
            200: {
              description: "List of posts retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Post",
                    },
                  },
                },
              },
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
        post: {
          summary: "Create a new post",
          description: "Create a new post (requires authentication)",
          tags: ["Posts"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PostRequest",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Post created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Post",
                  },
                },
              },
            },
            401: {
              $ref: "#/components/responses/UnauthorizedError",
            },
            400: {
              $ref: "#/components/responses/ValidationError",
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
      },
      "/post/{id}": {
        get: {
          summary: "Get post by ID",
          description: "Retrieve a specific post by its ID",
          tags: ["Posts"],
          security: [],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
              description: "Post ID",
              example: "507f1f77bcf86cd799439011",
            },
          ],
          responses: {
            200: {
              description: "Post retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Post",
                  },
                },
              },
            },
            404: {
              description: "Post not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
        put: {
          summary: "Update a post",
          description:
            "Update an existing post (only the post owner can update)",
          tags: ["Posts"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
              description: "Post ID",
              example: "507f1f77bcf86cd799439011",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PostRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Post updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Post",
                  },
                },
              },
            },
            401: {
              $ref: "#/components/responses/UnauthorizedError",
            },
            403: {
              description: "Forbidden - User can only update their own posts",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            404: {
              description: "Post not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            400: {
              $ref: "#/components/responses/ValidationError",
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
      },
      "/comment": {
        get: {
          summary: "Get all comments",
          description: "Retrieve a list of all comments",
          tags: ["Comments"],
          security: [],
          responses: {
            200: {
              description: "List of comments retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Comment",
                    },
                  },
                },
              },
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
        post: {
          summary: "Create a new comment",
          description:
            "Create a new comment on a post (requires authentication)",
          tags: ["Comments"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CommentRequest",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Comment created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Comment",
                  },
                },
              },
            },
            401: {
              $ref: "#/components/responses/UnauthorizedError",
            },
            400: {
              $ref: "#/components/responses/ValidationError",
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
      },
      "/comment/{id}": {
        get: {
          summary: "Get comment by ID",
          description: "Retrieve a specific comment by its ID",
          tags: ["Comments"],
          security: [],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
              description: "Comment ID",
              example: "507f1f77bcf86cd799439011",
            },
          ],
          responses: {
            200: {
              description: "Comment retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Comment",
                  },
                },
              },
            },
            404: {
              description: "Comment not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
        put: {
          summary: "Update a comment",
          description:
            "Update an existing comment (only the comment owner can update)",
          tags: ["Comments"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
              description: "Comment ID",
              example: "507f1f77bcf86cd799439011",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CommentRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Comment updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Comment",
                  },
                },
              },
            },
            401: {
              $ref: "#/components/responses/UnauthorizedError",
            },
            403: {
              description:
                "Forbidden - User can only update their own comments",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            404: {
              description: "Comment not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            400: {
              $ref: "#/components/responses/ValidationError",
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
        delete: {
          summary: "Delete a comment",
          description:
            "Delete an existing comment (only the comment owner can delete)",
          tags: ["Comments"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
              description: "Comment ID",
              example: "507f1f77bcf86cd799439011",
            },
          ],
          responses: {
            200: {
              description: "Comment deleted successfully",
            },
            401: {
              $ref: "#/components/responses/UnauthorizedError",
            },
            403: {
              description:
                "Forbidden - User can only delete their own comments",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            404: {
              description: "Comment not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/responses/ValidationError",
                  },
                },
              },
            },
            500: {
              $ref: "#/components/responses/ServerError",
            },
          },
        },
      },
    },
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User ID",
              example: "507f1f77bcf86cd799439011",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
            password: {
              type: "string",
              description: "Hashed password",
              example: "$2a$10$...",
            },
            refreshToken: {
              type: "array",
              items: { type: "string" },
              description: "Array of refresh tokens",
            },
          },
          required: ["email", "password"],
        },
        Post: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Post ID",
              example: "507f1f77bcf86cd799439011",
            },
            content: {
              type: "string",
              description: "Post content",
              example: "This is a sample post content",
            },
            sender: {
              type: "string",
              description: "User ID of the post sender",
              example: "507f1f77bcf86cd799439011",
            },
          },
          required: ["content", "sender"],
        },
        Comment: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Comment ID",
              example: "507f1f77bcf86cd799439011",
            },
            content: {
              type: "string",
              description: "Comment content",
              example: "This is a sample comment",
            },
            postId: {
              type: "string",
              description: "ID of the post this comment belongs to",
              example: "507f1f77bcf86cd799439011",
            },
            sender: {
              type: "string",
              description: "User ID of the comment sender",
              example: "507f1f77bcf86cd799439011",
            },
          },
          required: ["content", "postId", "sender"],
        },
        RegisterRequest: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "User password",
              example: "password123",
            },
          },
          required: ["email", "password"],
        },
        LoginRequest: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
            password: {
              type: "string",
              description: "User password",
              example: "password123",
            },
          },
          required: ["email", "password"],
        },
        RefreshTokenRequest: {
          type: "object",
          properties: {
            refreshToken: {
              type: "string",
              description: "Valid refresh token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
          required: ["refreshToken"],
        },
        TokensResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT access token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              description: "JWT refresh token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        PostRequest: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "Post content",
              example: "This is my new post content",
            },
          },
          required: ["content"],
        },
        CommentRequest: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "Comment content",
              example: "This is my comment on the post",
            },
            postId: {
              type: "string",
              description: "ID of the post to comment on",
              example: "507f1f77bcf86cd799439011",
            },
          },
          required: ["content", "postId"],
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
              example: "Invalid email or password",
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Unauthorized - Invalid or missing authentication",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        ValidationError: {
          description: "Validation error - Invalid request data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Removed - all docs are now in this file
};

const specs = swaggerJsdoc(options);

export default specs;
