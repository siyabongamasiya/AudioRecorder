export interface VoiceNote {
  id: string;
  name: string;
  date: string; // ISO
  duration: number; // seconds
  audioUri: string;
}

export interface AppSettings {
  recordingQuality: "low" | "medium" | "high";
  playbackSpeed: number;
  backupEnabled: boolean;
}
