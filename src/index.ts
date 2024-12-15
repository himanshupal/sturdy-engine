import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import "dotenv/config";
import express, { json } from "express";
import ffmpeg from "fluent-ffmpeg";
import { serve, setup } from "swagger-ui-express";

import { authenticate } from "./middlewares";
import routes from "./routes";
import { getJSONSpec } from "./utils/docs";

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = process.env.PORT || "8000";

// A namespace for API that may be helpful if we plan to upgrade in future
const namespace = "/api/v1";

app.use(
  json({
    limit: "2.5mb",
  }),
);

// Serve the docs
app.use(
  "/docs",
  serve,
  setup(
    getJSONSpec({
      host: namespace,
    }),
  ),
);

// Simple health check for the server
app.get("/ping", (_, res) => {
  res.send("pong");
});

app.use(namespace, authenticate, routes);

// Only execute the statement within when invoked as a module, i.e. via CLI
if (require.main === module) {
  app
    .listen(port, () => {
      console.debug("Server ready on port", port);
    })
    .on("error", (err) => {
      console.error("Critical exception handled in server:", err);
    });
}

export default app;
