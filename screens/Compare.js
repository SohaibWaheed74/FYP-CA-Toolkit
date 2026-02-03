import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const Compare = ({ navigation }) => {
  const [clock1] = useState(12);
  const [clock2] = useState(10);
  const [programACode, setProgramACode] = useState("");
  const [programBCode, setProgramBCode] = useState("");

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Programs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.parallelRow}>
          {/* Program A */}
          <View style={styles.programCard}>
            <Text style={styles.programTitle}>Program A</Text>

            <TouchableOpacity style={styles.openBtn}>
              <Ionicons
                name="folder-outline"
                size={16}
                color="#1E3A8A"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.openText}>Open</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.runBtn}>
              <Ionicons
                name="play"
                size={16}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.runText}>Run</Text>
            </TouchableOpacity>

            <View style={styles.codeBox}>
              <TextInput
                style={styles.codeInput}
                multiline
                placeholder="Enter Program A code here..."
                placeholderTextColor="#9CA3AF"
                value={programACode}
                onChangeText={setProgramACode}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Error Display</Text>
              <Text style={styles.infoValue}>No Errors</Text>
            </View>

            <View style={styles.clockBox}>
              <Text style={styles.clockText}>Clock Cycle:</Text>
              <Text style={styles.clockValue}>{clock1}</Text>
            </View>
          </View>

          {/* Program B */}
          <View style={styles.programCard}>
            <Text style={styles.programTitle}>Program B</Text>

            <TouchableOpacity style={styles.openBtn}>
              <Ionicons
                name="folder-outline"
                size={16}
                color="#1E3A8A"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.openText}>Open</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.runBtn}>
              <Ionicons
                name="play"
                size={16}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.runText}>Run</Text>
            </TouchableOpacity>

            <View style={styles.codeBox}>
              <TextInput
                style={styles.codeInput}
                multiline
                placeholder="Enter Program B code here..."
                placeholderTextColor="#9CA3AF"
                value={programBCode}
                onChangeText={setProgramBCode}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Error Display</Text>
              <Text style={styles.infoValue}>No Errors</Text>
            </View>

            <View style={styles.clockBox}>
              <Text style={styles.clockText}>Clock Cycle:</Text>
              <Text style={styles.clockValue}>{clock2}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Compare;

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "#1E3A8A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 10, paddingBottom: 24 },
  parallelRow: { flexDirection: "row", justifyContent: "space-between" },
  programCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 520,
  },
  programTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 6,
  },
  openBtn: {
    borderWidth: 1,
    borderColor: "#1E3A8A",
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  openText: { color: "#1E3A8A", fontWeight: "600", fontSize: 12 },
  runBtn: {
    backgroundColor: "#1E3A8A",
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  runText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  codeBox: {
    backgroundColor: "#F9FBFF",
    borderRadius: 8,
    padding: 10,
    minHeight: 390,
    borderColor: "#E1E7F5",
    marginBottom: 12,
  },
  codeInput: { fontFamily: "monospace", fontSize: 12, lineHeight: 16, color: "#1F2937", flex: 1 },
  infoBox: { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 8, marginBottom: 10 },
  infoTitle: { fontSize: 11, fontWeight: "600", color: "#1E3A8A" },
  infoValue: { fontSize: 11, color: "#64748B" },
  clockBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  clockText: { fontSize: 11, color: "#1E3A8A", fontWeight: "600" },
  clockValue: { fontSize: 11, fontWeight: "600" },
});
