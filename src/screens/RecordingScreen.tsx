import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useVoiceNotesContext } from "../contexts/VoiceNotesContext";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

export default function RecordingScreen() {
  const nav = useNavigation();
  const { isRecording, startRecording, stopRecording, cleanup } =
    useAudioRecorder();
  const { add } = useVoiceNotesContext();
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(
        () => setSeconds((s) => s + 1),
        1000
      ) as unknown as number;
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current)
        clearInterval(intervalRef.current as unknown as number);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      // Cleanup recording on unmount
      cleanup();
    };
  }, []);

  async function toggle() {
    if (!isRecording) {
      setSeconds(0);
      try {
        await startRecording();
      } catch (e: any) {
        console.warn("record-permission", e);
        Alert.alert(
          "Permission required",
          "Microphone permission is required to record audio."
        );
      }
    } else {
      const uri = await stopRecording();
      const id = `${Date.now()}`;
      const note = {
        id,
        name: `Recording ${new Date().toLocaleString()}`,
        date: new Date().toISOString(),
        duration: seconds,
        audioUri: uri || "",
      };
      await add(note as any);
      nav.goBack();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text>×</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.center}>
        <Text style={styles.timer}>
          {String(Math.floor(seconds / 60)).padStart(2, "0")}:
          {String(seconds % 60).padStart(2, "0")}
        </Text>
        <TouchableOpacity
          style={[styles.record, isRecording && { backgroundColor: "#ef4444" }]}
          onPress={toggle}
        >
          <Text style={{ fontSize: 32 }}>{isRecording ? "▮" : "●"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#667eea" },
  header: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  timer: { fontSize: 56, color: "#fff", fontWeight: "300" },
  record: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
});
