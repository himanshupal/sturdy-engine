import { mergeTestCases } from "./media.cases/merge";
import { shareTestCases } from "./media.cases/share";
import { trimTestCases } from "./media.cases/trim";
import { uploadTestCases } from "./media.cases/upload";

describe("Media Endpoint", () => {
  it("Uploads a file", uploadTestCases);
  it("Trims a file", trimTestCases);
  it("Merges files", mergeTestCases);

  it("Shares & fetch a file", shareTestCases, 15 * 1000);
});
