import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const EditorScreen = () => {
    const navigation = useNavigation();
    // STATES (UNCHANGED)
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    // HANDLERS (UNCHANGED)
   
     const handleRun = () => { 
        navigation.navigate("RegisterVisualization");
    };
    
    const handleCompare = () => { 
        navigation.navigate("Compare");
    };

    const handleRunStep = async () => { };
    const handleSave = async () => { };
    const handleOpen = async () => { };

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.wrapper}>

                {/* MAIN CARD */}
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
                    <View>
                        <TouchableOpacity style={styles.compareButton} onPress={handleCompare}>
                            <Text style={styles.compareButtonText}>Compare</Text>
                        </TouchableOpacity>
                    </View>

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
                        <Text style={styles.errorText}>
                            {error || "No Errors"}
                        </Text>
                    </View>

                </View>

            </ScrollView>
        </View>
    );
};

export default EditorScreen;
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#EEF2F9",
    },
    wrapper: {
        padding: 14,
    },

    /* Main Card */
    mainCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E3E8F2",
    },

    /* Toolbar */
    toolbar: {
        flexDirection: "row",
        width: "80%",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    runBtn: {
        backgroundColor: "#1F3C88",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    runText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    toolBtn: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#CCD5E4",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginRight: 6,
    },
    toolText: {
        fontSize: 11,
        color: "#334155",
        fontWeight: "500",
    },

    /* Editor */
    editorBox: {
        backgroundColor: "#F9FBFF",
        borderRadius: 10,
        padding: 10,
        minHeight: 360,
        borderWidth: 1,
        borderColor: "#E1E7F5",
        marginBottom: 10, // reduced gap
    },

    editorInput: {
        fontSize: 12,
        color: "#2C2F38",
        lineHeight: 18,
    },

    /* Error */
    errorTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#334155",
        marginBottom: 4,
        marginTop: 2, // NEW (tight)
    },

    errorBox: {
        backgroundColor: "#F4F7FD",
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E1E7F5",
        minHeight: 55,
    },

    errorText: {
        fontSize: 12,
        color: "#64748B",
    },
    primaryBtn: {
        backgroundColor: "#1F3C88",
        paddingVertical: 7,
        borderRadius: 6,
        flex: 1,
        alignItems: "center",
        marginRight: 6,
    },
    primaryText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    outlineBtn: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#1F3C88",
        paddingVertical: 7,
        borderRadius: 6,
        flex: 1,
        alignItems: "center",
        marginRight: 6,
    },
    outlineText: {
        color: "#1F3C88",
        fontSize: 12,
        fontWeight: "600",
    },
    compareButton: {
  backgroundColor: "#1E3A8A", // deep blue (same family as header)
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  marginVertical: 12,
  elevation: 3,              // Android shadow
  shadowColor: "#000",        // iOS shadow
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},

compareButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "600",
  letterSpacing: 0.5,
},


});
