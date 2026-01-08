import { useThemeColor } from "@/hooks/use-theme-color";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PlaybackBar from "../components/playback-bar";
import RenameModal from "../components/rename-modal";
import VoiceNoteCard from "../components/voice-note-card";
import { useVoiceNotesContext } from "../contexts/VoiceNotesContext";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

export default function HomeScreen() {
  const nav = useNavigation() as any;
  const insets = useSafeAreaInsets();
  const { notes, remove, rename } = useVoiceNotesContext();
  const {
    loadAndPlay,
    isPlaying,
    stop,
    currentUri,
    positionMillis,
    durationMillis,
    seekTo,
    pause,
    resume,
  } = useAudioPlayer();

  const fabColor = useThemeColor({}, "tint");
  const fabDefaultBottom = 28;
  const playbackBarHeight = 72;
  const fabBottom = currentUri
    ? insets.bottom + fabDefaultBottom + playbackBarHeight
    : insets.bottom + fabDefaultBottom;

  const [renameVisible, setRenameVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [query, setQuery] = useState("");

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.name.toLowerCase().includes(q));
  }, [notes, query]);

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (currentUri) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.06,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      pulse.setValue(1);
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [currentUri, pulse]);

  function onOptions(item: any) {
    Alert.alert(item.name, undefined, [
      {
        text: "Rename",
        onPress: () => {
          setRenameTarget({ id: item.id, name: item.name });
          setRenameVisible(true);
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => confirmDelete(item.id),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function confirmDelete(id: string) {
    Alert.alert(
      "Delete recording",
      "Are you sure you want to delete this recording?",
      [
        { text: "Yes", style: "destructive", onPress: () => remove(id) },
        { text: "No", style: "cancel" },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.searchRow, { paddingTop: insets.top + 12 }]}>
        <TextInput
          placeholder="Search notes by name"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search notes"
        />
        {query.length > 0 ? (
          <TouchableOpacity
            onPress={() => setQuery("")}
            style={styles.clearButton}
            accessibilityLabel="Clear search"
          >
            <Text>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.center}>
        {notes.length === 0 ? (
          <>
            <Text style={styles.empty}>No voice notes yet</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => nav.navigate("Recording" as never)}
            >
              <Text style={{ color: "#fff" }}>Record your first note</Text>
            </TouchableOpacity>
          </>
        ) : filteredNotes.length === 0 ? (
          <>
            <Text style={styles.empty}>No matching notes</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setQuery("")}
            >
              <Text style={{ color: "#fff" }}>Clear search</Text>
            </TouchableOpacity>
          </>
        ) : (
          <FlatList
            data={filteredNotes}
            contentContainerStyle={{ paddingVertical: 8 }}
            keyExtractor={(i) => i.id}
            style={{ width: "100%" }}
            renderItem={({ item }) => {
              const progress =
                currentUri === item.audioUri && durationMillis > 0
                  ? positionMillis / durationMillis
                  : 0;
              return (
                <VoiceNoteCard
                  note={item}
                  isPlaying={!!(isPlaying && currentUri === item.audioUri)}
                  progress={progress}
                  onPlay={async () => {
                    if (currentUri === item.audioUri) {
                      if (isPlaying) pause();
                      else resume();
                    } else {
                      try {
                        await loadAndPlay(item.audioUri);
                      } catch (e) {
                        Alert.alert(
                          "Playback Error",
                          "This audio file may have been deleted or is corrupted. Try deleting this note."
                        );
                      }
                    }
                  }}
                  onOptions={() => onOptions(item)}
                />
              );
            }}
          />
        )}
      </View>

      <Animated.View
        style={[
          styles.fab,
          {
            backgroundColor: fabColor,
            bottom: fabBottom,
            transform: [{ scale: pulse }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => nav.navigate("Recording" as never)}
          accessibilityLabel="Record new note"
          accessibilityRole="button"
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {currentUri ? (
        <PlaybackBar
          positionMillis={positionMillis}
          durationMillis={durationMillis}
          isPlaying={isPlaying}
          onToggle={() => {
            if (isPlaying) pause();
            else resume();
          }}
          onSeek={(ms) => seekTo(ms)}
        />
      ) : null}

      <RenameModal
        visible={renameVisible}
        initialName={renameTarget?.name}
        onCancel={() => {
          setRenameVisible(false);
          setRenameTarget(null);
        }}
        onSave={async (newName) => {
          if (renameTarget) {
            await rename(renameTarget.id, newName);
          }
          setRenameVisible(false);
          setRenameTarget(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { backgroundColor: "#fff", padding: 16, elevation: 2 },
  title: { fontSize: 20, fontWeight: "500" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  empty: { color: "#6b7280", marginBottom: 12 },
  button: {
    backgroundColor: "#667eea",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchRow: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  clearButton: { marginLeft: 8, padding: 8 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  fabIcon: { color: "#fff", fontSize: 28, fontWeight: "700" },
});
