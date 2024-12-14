import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import "dotenv/config";
import express, { json } from "express";
import ffmpeg from "fluent-ffmpeg";

import { authenticate } from "./middlewares";
import routes from "./routes";

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = process.env.PORT || "8000";

app.use(
  json({
    limit: "2.5mb",
  }),
);

// Simple health check for the server
app.use("/ping", (_, res) => {
  res.send("pong");
});

// A namespace for API that may be helpful if we plan to upgrade in future
app.use("/api/v1", authenticate, routes);

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
