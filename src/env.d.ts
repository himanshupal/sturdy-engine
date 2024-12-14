declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production";
    PORT?: string;
    AUTH_TOKEN: string;
  }
}
