import express from "express";

import routes from "./routes";

const app = express();
const port = process.env.PORT || "8000";

// Simple health check for the server
app.use("/ping", (_, res) => {
  res.send("pong");
});

// A namespace for API that may be helpful if we plan to upgrade in future
app.use("/api/v1", routes);

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
