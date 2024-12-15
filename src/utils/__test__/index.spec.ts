import { getRandomFileNameWithExtension, getRandomFilePath, getRandomString } from "..";

describe("Utilities", () => {
  it("Generates random string", () => {
    expect(getRandomString()).toHaveLength(12);
    expect(getRandomString(17)).toHaveLength(17);
    expect(getRandomString(32)).toHaveLength(32);
  });

  it("Generates random file name out of given file", () => {
    expect(getRandomFileNameWithExtension("sample.jpeg")).toContain(".jpeg");
    expect(getRandomFileNameWithExtension("sample.mp4")).toContain(".mp4");
  });

  it("Returns correct file upload path", () => {
    const generatedFilePath1 = getRandomFilePath("sample.mkv");
    expect(generatedFilePath1).toContain("/public/");
    expect(generatedFilePath1).toContain(".mkv");

    const generatedFilePath2 = getRandomFilePath("sample.mp4");
    expect(generatedFilePath2).toContain("/public/");
    expect(generatedFilePath2).toContain(".mp4");
  });
});
