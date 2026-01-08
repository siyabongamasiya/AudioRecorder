import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useVoiceNotesContext } from "../contexts/VoiceNotesContext";
import { AppSettings } from "../types";
import { exportBackup, importBackup } from "../utils/backup";
import { getJson, setJson } from "../utils/storage";

const KEY = "appSettings";

const DEFAULT: AppSettings = {
  recordingQuality: "high",
  playbackSpeed: 1.0,
  backupEnabled: false,
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT);
  const { notes, add } = useVoiceNotesContext();

  useEffect(() => {
    (async () => {
      const s = await getJson<AppSettings>(KEY, DEFAULT);
      setSettings(s);
    })();
  }, []);

  async function toggleBackup(val: boolean) {
    const next = { ...settings, backupEnabled: val };
    setSettings(next);
    await setJson(KEY, next);
  }

  async function setQuality(q: AppSettings["recordingQuality"]) {
    const next = { ...settings, recordingQuality: q };
    setSettings(next);
    await setJson(KEY, next);
  }

  async function changePlaybackSpeed() {
    Alert.prompt?.(
      "Playback speed",
      "Enter speed (e.g., 1.0, 1.5)",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Set",
          onPress: async (v: any) => {
            const n = parseFloat(v) || settings.playbackSpeed;
            const next = { ...settings, playbackSpeed: n };
            setSettings(next);
            await setJson(KEY, next);
          },
        },
      ],
      "plain-text",
      String(settings.playbackSpeed)
    );
  }

  async function handleExport() {
    try {
      await exportBackup(notes);
      Alert.alert(
        "Backup exported",
        "A backup file was created and share sheet opened."
      );
    } catch (e: any) {
      Alert.alert("Export failed", String(e));
    }
  }

  async function handleImport() {
    try {
      const res: any = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });
      if (res && res.uri) {
        const imported = await importBackup(res.uri);
        for (const n of imported) {
          await add(n);
        }
        Alert.alert("Import complete", `Imported ${imported.length} notes.`);
      }
    } catch (e: any) {
      Alert.alert("Import failed", String(e));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Recording quality</Text>
        <View style={styles.options}>
          <TouchableOpacity
            style={[
              styles.opt,
              settings.recordingQuality === "low" && styles.optActive,
            ]}
            onPress={() => setQuality("low")}
          >
            <Text>Low</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.opt,
              settings.recordingQuality === "medium" && styles.optActive,
            ]}
            onPress={() => setQuality("medium")}
          >
            <Text>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.opt,
              settings.recordingQuality === "high" && styles.optActive,
            ]}
            onPress={() => setQuality("high")}
          >
            <Text>High</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Playback speed</Text>
        <TouchableOpacity style={styles.btn} onPress={changePlaybackSpeed}>
          <Text> {settings.playbackSpeed}x </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Auto backup</Text>
        <Switch value={settings.backupEnabled} onValueChange={toggleBackup} />
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, { marginRight: 8 }]}
          onPress={handleExport}
        >
          <Text>Export backup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleImport}>
          <Text>Import backup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 18, fontWeight: "500", marginBottom: 12 },
  row: { marginVertical: 12 },
  label: { fontSize: 16, marginBottom: 6 },
  options: { flexDirection: "row" },
  opt: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  optActive: { backgroundColor: "#c7d2fe" },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
});
