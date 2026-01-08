// @ts-nocheck
import { VoiceNote } from "../types";
import { exportBackup, importBackup } from "./backup";

jest.mock("expo-file-system");
jest.mock("expo-sharing");

describe("backup utilities", () => {
  const sample: VoiceNote = {
    id: "note1",
    name: "Test Note",
    date: new Date().toISOString(),
    duration: 3,
    audioUri: "/mock/audio/note1.m4a",
  };

  it("exportBackup returns a path string", async () => {
    const out = await exportBackup([sample]);
    expect(typeof out).toBe("string");
  });

  it("importBackup restores notes from JSON", async () => {
    // create a fake backup JSON file
    const fs = require("expo-file-system");
    const backup = JSON.stringify({
      meta: { exportedAt: new Date().toISOString() },
      notes: [
        {
          id: sample.id,
          name: sample.name,
          date: sample.date,
          duration: sample.duration,
          audioFilename: "note1.m4a",
          audioBase64: "YmFzZTY0",
        },
      ],
    });
    const tmpPath = "/mock/doc/test-backup.json";
    await fs.writeAsStringAsync(tmpPath, backup, {
      encoding: fs.EncodingType.UTF8,
    });

    const restored = await importBackup(tmpPath);
    expect(Array.isArray(restored)).toBe(true);
    expect(restored[0].id).toBe(sample.id);
  });
});
