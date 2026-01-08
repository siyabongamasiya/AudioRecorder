import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { VoiceNote } from "../types";
import Waveform from "./waveform";

type Props = {
  note: VoiceNote;
  onPlay: () => void;
  onOptions?: () => void;
  isPlaying?: boolean;
  progress?: number;
};

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

export default function VoiceNoteCard({
  note,
  onPlay,
  onOptions,
  isPlaying,
  progress = 0,
}: Props) {
  const tint = useThemeColor({}, "tint");

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPlay}
      accessibilityRole="button"
      accessibilityLabel={`Play ${note.name}`}
    >
      <View
        style={[
          styles.playCircle,
          isPlaying && styles.playing,
          { backgroundColor: isPlaying ? "#ef4444" : tint },
        ]}
      >
        <Text style={styles.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {note.name}
        </Text>
        <Text style={styles.meta}>
          {new Date(note.date).toLocaleString()} •{" "}
          {fmtDuration(Math.round(note.duration))}
        </Text>
        <View style={{ marginTop: 8 }}>
          <Waveform seed={note.id} progress={progress} height={28} />
        </View>
      </View>
      <TouchableOpacity
        onPress={onOptions}
        style={styles.options}
        accessibilityLabel={`Options for ${note.name}`}
      >
        <Text style={styles.optionsText}>⋯</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#667eea",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playing: {
    backgroundColor: "#ef4444",
  },
  playIcon: { color: "#fff", fontSize: 18, fontWeight: "600" },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: "#111827" },
  meta: { marginTop: 4, color: "#6b7280", fontSize: 12 },
  options: { padding: 8 },
  optionsText: { fontSize: 20, color: "#9ca3af" },
});
