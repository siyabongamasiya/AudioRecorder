import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { VoiceNote } from "../types";

type BackupNote = {
  id: string;
  name: string;
  date: string;
  duration: number;
  audioFilename: string;
  audioBase64: string;
};

type BackupFile = {
  meta: { exportedAt: string };
  notes: BackupNote[];
};

export async function exportBackup(notes: VoiceNote[]) {
  const packed: BackupFile = {
    meta: { exportedAt: new Date().toISOString() },
    notes: [],
  };

  for (const n of notes) {
    try {
      const uri = n.audioUri;
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: (FileSystem as any).EncodingType?.Base64 || "base64",
      } as any);
      const extMatch = uri.match(/\.([a-z0-9]+)(?:\?|$)/i);
      const ext = extMatch ? `.${extMatch[1]}` : ".m4a";
      const filename = `${n.id}${ext}`;
      packed.notes.push({
        id: n.id,
        name: n.name,
        date: n.date,
        duration: n.duration,
        audioFilename: filename,
        audioBase64: base64,
      });
    } catch (e) {
      console.warn("exportBackup: skip note", n.id, e);
    }
  }

  const out = JSON.stringify(packed);
  const outPath =
    (FileSystem as any).documentDirectory +
    `voice-notes-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(outPath, out, {
    encoding: (FileSystem as any).EncodingType?.UTF8 || "utf8",
  } as any);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(outPath);
  }

  return outPath;
}

export async function importBackup(fileUri: string) {
  const txt = await FileSystem.readAsStringAsync(fileUri, {
    encoding: (FileSystem as any).EncodingType?.UTF8 || "utf8",
  } as any);
  const parsed: BackupFile = JSON.parse(txt);
  const imported: VoiceNote[] = [];

  for (const bn of parsed.notes) {
    try {
      const targetPath =
        (FileSystem as any).documentDirectory + bn.audioFilename;
      await FileSystem.writeAsStringAsync(targetPath, bn.audioBase64, {
        encoding: (FileSystem as any).EncodingType?.Base64 || "base64",
      } as any);
      imported.push({
        id: bn.id,
        name: bn.name,
        date: bn.date,
        duration: bn.duration,
        audioUri: targetPath,
      });
    } catch (e) {
      console.warn("importBackup: failed to restore", bn.id, e);
    }
  }

  return imported;
}
