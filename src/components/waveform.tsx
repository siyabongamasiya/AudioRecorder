import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { generatePeaks } from "../utils/seeded-random";

type Props = {
  seed: string;
  bars?: number;
  progress?: number; // 0..1
  height?: number;
  color?: string;
};

export default function Waveform({
  seed,
  bars = 40,
  progress = 0,
  height = 40,
  color = "#c7d2fe",
}: Props) {
  const peaks = useMemo(() => generatePeaks(seed, bars), [seed, bars]);
  const anim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [progress, anim]);

  return (
    <View style={[styles.row, { height }]}>
      {peaks.map((p, i) => {
        const idx = i / peaks.length;
        const inputMin = Math.max(0, idx - 0.02);
        const inputMax = Math.min(1, idx + 0.02);
        const bg = anim.interpolate({
          inputRange: [inputMin, inputMax],
          outputRange: ["#e6e7ef", color],
          extrapolate: "clamp",
        });
        const barHeight = Math.max(2, p * height);

        return (
          <View key={i} style={styles.barContainer}>
            <Animated.View
              style={[styles.bar, { height: barHeight, backgroundColor: bg }]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  barContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  bar: { width: 3, borderRadius: 2 },
});
