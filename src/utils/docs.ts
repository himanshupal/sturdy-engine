export interface JSONSpecFields {
  host: string;
}

const commonErrorSchema = (descriptionType: "json" | "string") => {
  return {
    content: {
      "application/json": {
        schema: {
          required: ["message"],
          properties: {
            message: {
              type: "string",
            },
            description: {
              type: descriptionType === "string" ? descriptionType : "array",
              ...(descriptionType !== "string" && {
                items: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                    },
                    type: {
                      type: "string",
                    },
                    code: {
                      type: "string",
                    },
                    path: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                },
              }),
            },
          },
        },
      },
    },
  };
};

const videoFileSchema = {
  content: {
    "application/json": {
      schema: {
        required: ["id", "size", "title", "duration", "fileName"],
        properties: {
          id: { type: "string" },
          size: { type: "number" },
          title: { type: "string" },
          description: { type: "string" },
          duration: { type: "number" },
          fileName: { type: "string" },
        },
      },
    },
  },
};

export const getJSONSpec = (fields: JSONSpecFields) => ({
  openapi: "3.0.0",
  info: {
    description: "Assignment on video upload & manipulation via REST API",
    version: "0.1.0",
    title: "Sturdy Engine Video API",
    contact: { email: "mailtohimanshupal@gmail.com" },
    license: { name: "Apache 2.0", url: "http://www.apache.org/licenses/LICENSE-2.0.html" },
  },
  servers: [{ url: fields.host }],
  tags: [
    { name: "video", description: "Upload or modify a video" },
    { name: "share", description: "Share a video with the world out there" },
  ],
  paths: {
    "/media/upload": {
      post: {
        tags: ["video"],
        summary: "Upload a new video",
        requestBody: {
          required: true,
          description: "Don't forget to add a cool title",
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "media"],
                properties: {
                  title: {
                    type: "string",
                    required: true,
                    description: "Short summary of the video",
                  },
                  description: {
                    type: "string",
                    description: "Optional details of what going on",
                  },
                  media: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
              encoding: {
                media: {
                  contentType: "video/*",
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Video uploaded successfully", ...videoFileSchema },
          400: { description: "Issue found in input data", ...commonErrorSchema("string") },
          422: { description: "Body data validation failed", ...commonErrorSchema("json") },
          500: { description: "Server error" },
        },
        security: [{ authToken: [] }],
      },
    },
    "/media/merge": {
      post: {
        tags: ["video"],
        summary: "Merge videos together for more fun",
        requestBody: {
          required: true,
          description: "Merge 2 or more videos using their ids",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "videos"],
                properties: {
                  title: { type: "string", description: "Title of the merged video" },
                  description: { type: "string", description: "Optional details of what going on" },
                  videos: {
                    type: "array",
                    items: { type: "number", example: 2 },
                    description: "List of ids of the videos to be merged together",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Video merged successfully", ...videoFileSchema },
          400: { description: "Issue found in input data", ...commonErrorSchema("string") },
          404: { description: "Some video given in list is not found", ...commonErrorSchema("string") },
          422: { description: "Body data validation failed", ...commonErrorSchema("json") },
          500: { description: "Server error" },
        },
        security: [{ authToken: [] }],
      },
    },
    "/media/trim": {
      post: {
        tags: ["video"],
        summary: "Trim video to safekeep what's important",
        requestBody: {
          required: true,
          description: "Use either seconds or timestamp to trim the video",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id", "startAt", "endAt"],
                properties: {
                  id: { type: "number", format: "int64", example: 1 },
                  startAt: { type: "string", example: 119, description: "119 seconds from the start" },
                  endAt: {
                    type: "string",
                    example: "03:34",
                    description: "Till 03:34 in the video",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Video processed successfully", ...videoFileSchema },
          400: { description: "Issue found in input data", ...commonErrorSchema("string") },
          404: { description: "Video you are trying to edit is not found", ...commonErrorSchema("string") },
          422: { description: "Body data validation failed", ...commonErrorSchema("json") },
          500: { description: "Server error" },
        },
        security: [{ authToken: [] }],
      },
    },
    "/media/{identifier}": {
      get: {
        tags: ["video"],
        summary: "Get a video shared by someone",
        parameters: [
          {
            in: "path",
            name: "identifier",
            description: "ID of the video to be fetched",
            required: true,
          },
          {
            in: "query",
            name: "download",
            description: "Put anything here to download the file",
          },
        ],
        responses: {
          200: {
            description: "Video is ready to be viewed",
            content: {
              "video/*": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          403: { description: "File sharing has expired", ...commonErrorSchema("string") },
          404: { description: "Video you are trying to get is not found", ...commonErrorSchema("string") },
          500: { description: "Server error" },
        },
        security: [{ authToken: [] }],
      },
    },
    "/media/share": {
      put: {
        tags: ["share"],
        summary: "Share a video because sharing is caring",
        requestBody: {
          required: true,
          description: "Share for a duration or till whenever you want.",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  {
                    type: "object",
                    required: ["id", "duration"],
                    properties: {
                      id: { type: "number", format: "int64", example: 4 },
                      duration: { type: "number", example: 120, description: "Number of seconds to share video for" },
                    },
                  },
                  {
                    type: "object",
                    required: ["id", "expireAt"],
                    properties: {
                      id: { type: "number", format: "int64", example: 4 },
                      expireAt: { type: "string", description: "JSON timestamp till then video is to be shared" },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Video is ready to be shared",
            content: {
              "application/json": {
                schema: {
                  required: ["url", "expireAt"],
                  properties: {
                    url: {
                      type: "string",
                      format: "url",
                    },
                    expireAt: {
                      type: "string",
                      format: "datetime",
                    },
                  },
                },
              },
            },
          },
          404: { description: "Video you are trying to share is not found", ...commonErrorSchema("string") },
          422: { description: "Body data validation failed", ...commonErrorSchema("json") },
          500: { description: "Server error" },
        },
        security: [{ authToken: [] }],
      },
    },
  },
  components: {
    securitySchemes: {
      authToken: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
});
