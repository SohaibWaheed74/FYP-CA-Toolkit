import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import RNFS from "react-native-fs";
import { pick, pickDirectory, types } from "@react-native-documents/picker";

const EditorScreen = () => {
  const navigation = useNavigation();

  // STATES
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileNameInput, setFileNameInput] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);

  // HANDLERS
  const handleRun = () => {
    navigation.navigate("RegisterVisualization");
  };

  const handleCompare = () => {
    navigation.navigate("Compare");
  };

  const handleRunStep = () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please write some assembly code first.");
      return;
    }

    // Convert editor text into clean instruction array
    const programLines = code
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    navigation.navigate("Debugging", {
      program: programLines,
    });
  };


  // ===== SAVE FILE =====
  const handleSave = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Nothing to save");
      return;
    }

    setModalVisible(true); // open modal for filename input
  };

  const saveFile = async () => {
    if (!fileNameInput.trim()) {
      Alert.alert("Error", "Filename required");
      return;
    }

    try {
      const fileNameWithExt = fileNameInput.endsWith(".txt")
        ? fileNameInput
        : `${fileNameInput}.txt`;

      // Save in app's document directory (safe cross-platform)
      const finalPath = `${RNFS.DocumentDirectoryPath}/${fileNameWithExt}`;

      await RNFS.writeFile(finalPath, code, "utf8");

      setModalVisible(false);
      setFileNameInput("");

      Alert.alert("Success", `Saved as ${fileNameWithExt}`);
      console.log("File saved at:", finalPath);
    } catch (err) {
      const message = err?.message || "Unknown error";
      console.log("Save file error:", err);
      Alert.alert("Error saving file", message);
    }
  };


  // ===== OPEN FILE =====
  const handleOpen = async () => {
    try {
      const result = await pick({
        type: [types.plainText],
        allowMultiSelection: false,
        copyTo: "cachesDirectory",
      });

      if (!result || !result[0]) return;

      const file = result[0];
      const fileUri = file.fileCopyUri || file.uri;
      if (!fileUri) {
        Alert.alert("Error", "Invalid file URI");
        return;
      }

      const path = fileUri.replace("file://", "");
      const content = await RNFS.readFile(path, "utf8");

      setCode(content);
      Alert.alert("Success", `Loaded ${file.name}`);
    } catch (err) {
      const code = err?.code || "OPEN_ERROR";
      const message = err?.message || "Unknown error";
      console.log("Open file error:", err);
      if (code !== "DOCUMENT_PICKER_CANCELED") {
        Alert.alert("Error opening file", message);
      } else {
        console.log("User cancelled file picker");
      }
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <View style={styles.mainCard}>
          {/* Toolbar */}
          <View style={styles.toolbar}>
            <TouchableOpacity
              style={styles.runBtn}
              onPress={handleRun}
              disabled={isRunning}
            >
              {isRunning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>▶ Run</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRunStep}>
              <Text style={styles.primaryText}>Run Step</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineBtn} onPress={handleSave}>
              <Text style={styles.outlineText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineBtn} onPress={handleOpen}>
              <Text style={styles.outlineText}>Open</Text>
            </TouchableOpacity>
          </View>

          {/* Compare Button */}
          <TouchableOpacity style={styles.compareButton} onPress={handleCompare}>
            <Text style={styles.compareButtonText}>Compare</Text>
          </TouchableOpacity>

          {/* Code Editor */}
          <View style={styles.editorBox}>
            <TextInput
              value={code}
              onChangeText={setCode}
              multiline
              textAlignVertical="top"
              placeholder="Write your assembly code here..."
              placeholderTextColor="#A0A8B8"
              style={styles.editorInput}
            />
          </View>

          {/* Error Display */}
          <Text style={styles.errorTitle}>Error Display</Text>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error || "No Errors"}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Filename Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Filename</Text>
            <TextInput
              value={fileNameInput}
              onChangeText={setFileNameInput}
              placeholder="example.txt"
              style={styles.modalInput}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalBtn}
              >
                <Text style={{ color: "red" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveFile} style={styles.modalBtn}>
                <Text style={{ color: "green" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ===== Styles =====
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#EEF2F9" },
  wrapper: { padding: 14 },
  mainCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#E3E8F2" },
  toolbar: { flexDirection: "row", width: "80%", justifyContent: "space-between", marginBottom: 10 },
  runBtn: { backgroundColor: "#1F3C88", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginRight: 6 },
  primaryBtn: { backgroundColor: "#1F3C88", paddingVertical: 7, borderRadius: 6, flex: 1, alignItems: "center", marginRight: 6 },
  primaryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  outlineBtn: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#1F3C88", paddingVertical: 7, borderRadius: 6, flex: 1, alignItems: "center", marginRight: 6 },
  outlineText: { color: "#1F3C88", fontSize: 12, fontWeight: "600" },
  compareButton: { backgroundColor: "#1E3A8A", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginVertical: 12, elevation: 3 },
  compareButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  editorBox: { backgroundColor: "#F9FBFF", borderRadius: 10, padding: 10, minHeight: 360, borderWidth: 1, borderColor: "#E1E7F5", marginBottom: 10 },
  editorInput: { fontSize: 12, color: "#2C2F38", lineHeight: 18 },
  errorTitle: { fontSize: 12, fontWeight: "600", color: "#334155", marginBottom: 4, marginTop: 2 },
  errorBox: { backgroundColor: "#F4F7FD", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#E1E7F5", minHeight: 55 },
  errorText: { fontSize: 12, color: "#64748B" },
  modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  modalTitle: { marginBottom: 10, fontWeight: "600", fontSize: 16 },
  modalInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8, marginBottom: 20 },
  modalBtns: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: { padding: 10 },
});

export default EditorScreen;
