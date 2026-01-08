import * as FileSystem from "expo-file-system";
import React, { createContext, useContext, useEffect, useState } from "react";
import { VoiceNote } from "../types/index";
import { getJson, setJson } from "../utils/storage";

const KEY = "voiceNotes";

type ContextValue = {
  notes: VoiceNote[];
  add: (note: VoiceNote) => Promise<void> | void;
  remove: (id: string) => Promise<void> | void;
  rename: (id: string, name: string) => Promise<void> | void;
};

const DefaultContext: ContextValue = {
  notes: [],
  add: async () => {},
  remove: async () => {},
  rename: async () => {},
};

const VoiceNotesContext = createContext<ContextValue>(DefaultContext);

export function VoiceNotesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notes, setNotes] = useState<VoiceNote[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await getJson<VoiceNote[]>(KEY, []);
      setNotes(stored || []);
    })();
  }, []);

  async function add(note: VoiceNote) {
    const next = [note, ...notes];
    setNotes(next);
    await setJson<VoiceNote[]>(KEY, next);
  }

  async function remove(id: string) {
    const note = notes.find((n) => n.id === id);
    if (note?.audioUri) {
      try {
        await (FileSystem as any).deleteAsync(note.audioUri, {
          idempotent: true,
        });
      } catch (e) {
        console.warn("Failed to delete audio file", e);
      }
    }
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    await setJson<VoiceNote[]>(KEY, next);
  }

  async function rename(id: string, name: string) {
    const next = notes.map((n) => (n.id === id ? { ...n, name } : n));
    setNotes(next);
    await setJson<VoiceNote[]>(KEY, next);
  }

  return (
    <VoiceNotesContext.Provider value={{ notes, add, remove, rename }}>
      {children}
    </VoiceNotesContext.Provider>
  );
}

export function useVoiceNotesContext() {
  return useContext(VoiceNotesContext);
}
