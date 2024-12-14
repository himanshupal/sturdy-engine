import { isAuthTokenValid } from "../authentication";

it("Verifies auth token correctly", () => {
  expect(isAuthTokenValid(`Bearer ${process.env.AUTH_TOKEN}`)).toBeTruthy();
  expect(isAuthTokenValid(`Bearer invalid token`)).toBeFalsy();
  expect(isAuthTokenValid(`Some random token`)).toBeFalsy();
});
