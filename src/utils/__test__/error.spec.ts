import { TxError } from "../error";

const message = "Test Message";
const statusCode = 500;

describe("TxError", () => {
  it("Reads single message correctly", () => {
    const error = new TxError(message, statusCode);
    expect(error.response).toEqual({ message: message });
    expect(error.statusCode).toEqual(statusCode);
  });

  it("Reads message with description correctly", () => {
    const payload = { message, description: "Description for test message" };
    const error = new TxError(payload, statusCode);
    expect(error.response).toEqual(payload);
    expect(error.statusCode).toEqual(statusCode);
  });
});
