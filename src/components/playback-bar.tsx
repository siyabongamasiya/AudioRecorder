import { useThemeColor } from "@/hooks/use-theme-color";
import React, { useState } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import Waveform from "./waveform";

type Props = {
  positionMillis: number;
  durationMillis: number;
  onToggle: () => void;
  isPlaying: boolean;
  onSeek?: (ms: number) => void;
};

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

export default function PlaybackBar({
  positionMillis,
  durationMillis,
  onToggle,
  isPlaying,
  onSeek,
}: Props) {
  const pct =
    durationMillis > 0 ? Math.min(1, positionMillis / durationMillis) : 0;
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState<number>(1);
  const tint = useThemeColor({}, "tint");

  function onLayoutProgress(e: LayoutChangeEvent) {
    setBarWidth(e.nativeEvent.layout.width || 1);
  }

  function onPressProgress(e: GestureResponderEvent) {
    if (!onSeek || durationMillis <= 0) return;
    const native = e.nativeEvent as any;
    const locationX =
      typeof native.locationX === "number" ? native.locationX : 0;
    const ratio = Math.max(0, Math.min(1, locationX / (barWidth || 1)));
    const ms = Math.round(ratio * durationMillis);
    onSeek(ms);
  }

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom, 8),
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <TouchableOpacity onPress={onToggle} style={styles.playBtn}>
        <Text style={styles.playText}>{isPlaying ? "⏸" : "▶"}</Text>
      </TouchableOpacity>
      <View
        style={styles.progressWrap}
        onStartShouldSetResponder={() => true}
        onResponderRelease={onPressProgress}
        onLayout={onLayoutProgress}
      >
        <View style={[styles.progress, { width: `${pct * 100}%` }]} />
      </View>
      <View style={styles.times}>
        <Text style={styles.time}>{fmt(positionMillis)}</Text>
        <Text style={styles.time}>{fmt(durationMillis)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  playBtn: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  playText: { fontSize: 22 },
  progressWrap: {
    flex: 1,
    height: 22,
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 12,
    justifyContent: "center",
  },
  progress: { height: "100%", backgroundColor: "#667eea" },
  times: { width: 96, flexDirection: "row", justifyContent: "space-between" },
  time: { fontSize: 12, color: "#6b7280" },
});
