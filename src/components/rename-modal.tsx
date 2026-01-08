import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  initialName?: string;
  onCancel: () => void;
  onSave: (name: string) => void;
};

export default function RenameModal({
  visible,
  initialName = "",
  onCancel,
  onSave,
}: Props) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        style={styles.backdrop}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Rename recording</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Name"
            autoFocus
          />
          <View style={styles.row}>
            <TouchableOpacity style={styles.btn} onPress={onCancel}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.primary]}
              onPress={() => onSave(name.trim() || initialName)}
            >
              <Text style={[styles.btnText, { color: "#fff" }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  container: {
    width: "86%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  row: { flexDirection: "row", justifyContent: "flex-end" },
  btn: { paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8 },
  primary: { backgroundColor: "#667eea", borderRadius: 8 },
  btnText: { color: "#111827" },
});
