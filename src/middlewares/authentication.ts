import type { NextFunction, Request, Response } from "express-serve-static-core";

/**
 * Function to verify the authorization header
 * @param token Header passed down from the request being made
 * @returns Whether the header is valid or not
 */
export const isAuthTokenValid = (token: string): boolean => {
  const [prefix, value] = token.split(" ");

  if (prefix.toLowerCase() !== "bearer") return false;
  if (value !== process.env.AUTH_TOKEN) return false;
  return true;
};

/**
 * Middleware to authenticate the requests being made
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(400);
    return;
  }

  if (!isAuthTokenValid(req.headers.authorization)) {
    res.sendStatus(401);
    return;
  }

  return next();
};
