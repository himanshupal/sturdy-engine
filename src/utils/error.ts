import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { Response } from "express";
import { ZodError } from "zod";

import { dataIsString } from ".";

type ErrorData = {
  message: string;
  description: string;
};

export class TxError extends Error {
  #statusCode: number;
  #data: string | ErrorData;

  constructor(data: string, statusCode: number);
  constructor(data: ErrorData, statusCode: number);
  constructor(data: string | ErrorData, statusCode: number) {
    super(dataIsString(data) ? data : data.message);
    this.#statusCode = statusCode;
    this.#data = data;
  }

  get statusCode() {
    return this.#statusCode;
  }

  get response() {
    return dataIsString(this.#data) ? { message: this.#data } : this.#data;
  }
}

export const handleError = (identifier: string, res: Response, err: unknown) => {
  if (err instanceof ZodError) {
    console.error(`${identifier}:ZodError:`, err.flatten());
    return res.status(422).json({
      message: "Please check the data provided",
      description: err.issues,
    });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    console.error(`${identifier}:PrismaClientKnownRequestError:`, err);
    return res.status(400).send(err.message);
  }

  if (err instanceof TxError) {
    console.error(`${identifier}:TxError:`, err);
    return res.status(err.statusCode).json(err.response);
  }

  console.error(`${identifier}:Unknown:`, err);
  return res.sendStatus(500);
};
