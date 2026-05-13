// src/components/CycleAnimationScreen.js

import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  StatusBar,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

const STAGE_COLORS = {
  Fetch: "#2563EB",
  Decode: "#6D28D9",
  Execute: "#16A34A",
};

const STAGE_BG = {
  Fetch: "#EAF2FF",
  Decode: "#F2EAFE",
  Execute: "#EAFBF1",
};

const normalize = (value) => String(value || "").trim().toUpperCase();

const getStageColor = (stage) => STAGE_COLORS[stage] || "#2563EB";
const getStageBg = (stage) => STAGE_BG[stage] || "#EAF2FF";

const displayValue = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
};

const isChanged = (changedList = [], name) => {
  return changedList.some((item) => normalize(item) === normalize(name));
};

const ValueCard = ({ name, value, changed, type = "register" }) => {
  return (
    <View
      style={[
        styles.valueCard,
        type === "flag" && styles.flagCard,
        changed && styles.changedCard,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.valueName, changed && styles.changedText]}
      >
        {name}
      </Text>

      <Text
        numberOfLines={1}
        style={[styles.valueNumber, changed && styles.changedText]}
      >
        {displayValue(value)}
      </Text>
    </View>
  );
};

const TimelineDot = ({ cycle, active, done }) => {
  const color = getStageColor(cycle?.stage);

  return (
    <View style={styles.timelineItem}>
      <View
        style={[
          styles.timelineCircle,
          done && { backgroundColor: color, borderColor: color },
          active && styles.activeTimelineCircle,
        ]}
      >
        {done && !active ? (
          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
        ) : (
          <Text
            style={[
              styles.timelineCircleText,
              active && { color: "#FFFFFF" },
            ]}
          >
            {cycle?.tState || "-"}
          </Text>
        )}
      </View>

      <Text numberOfLines={1} style={styles.timelineText}>
        {cycle?.stage || "-"}
      </Text>
    </View>
  );
};

const CycleAnimationScreen = ({
  visible,
  onClose,
  cycleTrace = [],
  architectureName = "Selected Architecture",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const timelineScrollRef = useRef(null);

  const [isRunning, setIsRunning] = useState(true);

  const totalCycles = Array.isArray(cycleTrace) ? cycleTrace.length : 0;
  const safeIndex =
    totalCycles > 0 ? Math.min(currentIndex, totalCycles - 1) : 0;

  const currentCycle = totalCycles > 0 ? cycleTrace[safeIndex] : null;

  const currentStage = currentCycle?.stage || "Fetch";
  const stageColor = getStageColor(currentStage);
  const stageBg = getStageBg(currentStage);

  const isLastCycle = totalCycles > 0 && safeIndex === totalCycles - 1;
  const showPauseButton = isRunning && !isLastCycle;

  const progressPercent =
    totalCycles > 0 ? ((safeIndex + 1) / totalCycles) * 100 : 0;

  const registerEntries = Object.entries(currentCycle?.registers || {});
  const flagEntries = Object.entries(currentCycle?.flags || {});
  const memoryEntries = Object.entries(currentCycle?.memory || {});

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      setIsRunning(totalCycles > 1);
    }
  }, [visible, totalCycles]);

  useEffect(() => {
    if (!visible) return;
    if (!isRunning) return;
    if (totalCycles === 0) return;
    if (safeIndex >= totalCycles - 1) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        return next >= totalCycles ? totalCycles - 1 : next;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [visible, isRunning, safeIndex, totalCycles]);

  useEffect(() => {
    if (!visible) return;

    if (isLastCycle) {
      setIsRunning(false);
    }
  }, [visible, isLastCycle]);

  useEffect(() => {
    if (!visible) return;

    cardAnim.setValue(0);
    ringAnim.setValue(0);

    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(ringAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      timelineScrollRef.current?.scrollTo({
        x: Math.max(safeIndex * 46 - 30, 0),
        animated: true,
      });
    }, 50);
  }, [safeIndex, visible, cardAnim, ringAnim]);

  const ringRotate = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const toggleRunning = () => {
    if (totalCycles === 0) return;

    if (isLastCycle) {
      setCurrentIndex(0);
      setIsRunning(totalCycles > 1);
      return;
    }

    setIsRunning((prev) => !prev);
  };

  const goBackStep = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const closeScreen = () => {
    setCurrentIndex(0);
    setIsRunning(true);
    onClose?.();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <StatusBar barStyle="light-content" backgroundColor="#1F3C88" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={20}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.headerTextBox}>
                <Text style={styles.headerTitle}>Cycle Animation</Text>
                <Text numberOfLines={1} style={styles.headerSubtitle}>
                  {architectureName}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={closeScreen}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>{totalCycles}</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Current</Text>
                <Text style={styles.summaryValue}>
                  {currentCycle?.tState || "-"}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Status</Text>
                <Text
                  style={[
                    styles.summaryStatus,
                    { color: isLastCycle ? "#16A34A" : "#1F3C88" },
                  ]}
                >
                  {totalCycles === 0 ? "Empty" : isLastCycle ? "Done" : "Run"}
                </Text>
              </View>
            </View>

            <Animated.View
              style={[
                styles.mainCard,
                {
                  opacity: cardAnim,
                  transform: [
                    {
                      scale: cardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.98, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.mainTopRow}>
                <View style={styles.ringBox}>
                  <Animated.View
                    style={[
                      styles.ring,
                      {
                        borderColor: stageColor,
                        transform: [{ rotate: ringRotate }],
                      },
                    ]}
                  />

                  <Text style={[styles.bigT, { color: stageColor }]}>
                    {currentCycle?.tState || "T0"}
                  </Text>
                </View>

                <View style={styles.infoBox}>
                  <View
                    style={[styles.stageBadge, { backgroundColor: stageBg }]}
                  >
                    <Text style={[styles.stageText, { color: stageColor }]}>
                      {currentStage.toUpperCase()}
                    </Text>
                  </View>

                  <Text style={styles.label}>Instruction</Text>
                  <Text numberOfLines={1} style={styles.instructionText}>
                    {currentCycle?.instruction || "-"}
                  </Text>

                  <Text style={styles.counterText}>
                    Cycle {totalCycles > 0 ? safeIndex + 1 : 0} of{" "}
                    {totalCycles}
                  </Text>
                </View>
              </View>

              <View style={[styles.microBox, { borderColor: stageColor }]}>
                <Text style={styles.label}>Micro Operation</Text>
                <Text
                  numberOfLines={2}
                  style={[styles.microText, { color: stageColor }]}
                >
                  {currentCycle?.microOperation || "-"}
                </Text>
              </View>
            </Animated.View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: stageColor,
                  },
                ]}
              />
            </View>

            {/* <View style={styles.controlRow}>
              <TouchableOpacity
                style={[
                  styles.stepBackButton,
                  (safeIndex === 0 || totalCycles === 0) &&
                    styles.disabledControl,
                ]}
                onPress={goBackStep}
                disabled={safeIndex === 0 || totalCycles === 0}
              >
                <Ionicons name="arrow-back" size={16} color="#1F3C88" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.playPauseButton,
                  totalCycles === 0 && styles.disabledControl,
                ]}
                onPress={toggleRunning}
                disabled={totalCycles === 0}
              >
                <Ionicons
                  name={showPauseButton ? "pause" : "play"}
                  size={15}
                  color="#FFFFFF"
                />
                <Text style={styles.playPauseText}>
                  {showPauseButton ? "Pause" : "Start"}
                </Text>
              </TouchableOpacity>
            </View> */}

            <ScrollView
              ref={timelineScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timelineRow}
            >
              {cycleTrace.map((cycle, index) => (
                <TimelineDot
                  key={`${cycle?.tState || "T"}-${index}`}
                  cycle={cycle}
                  active={index === safeIndex}
                  done={index <= safeIndex}
                />
              ))}
            </ScrollView>

            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={17}
                  color="#1F3C88"
                />
                <Text style={styles.sectionTitle}>Registers</Text>
              </View>

              <View style={styles.valuesGrid}>
                {registerEntries.length === 0 ? (
                  <Text style={styles.emptyText}>No registers found</Text>
                ) : (
                  registerEntries.map(([name, value]) => (
                    <ValueCard
                      key={name}
                      name={name}
                      value={value}
                      changed={isChanged(currentCycle?.changedRegisters, name)}
                    />
                  ))
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="flag-outline" size={17} color="#6D28D9" />
                <Text style={styles.sectionTitle}>Flags</Text>
              </View>

              <View style={styles.valuesGrid}>
                {flagEntries.length === 0 ? (
                  <Text style={styles.emptyText}>No flags found</Text>
                ) : (
                  flagEntries.map(([name, value]) => (
                    <ValueCard
                      key={name}
                      name={name}
                      value={value}
                      type="flag"
                      changed={isChanged(currentCycle?.changedFlags, name)}
                    />
                  ))
                )}
              </View>
            </View>

            {memoryEntries.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="server-outline" size={17} color="#16A34A" />
                  <Text style={styles.sectionTitle}>Memory</Text>
                </View>

                <View style={styles.valuesGrid}>
                  {memoryEntries.map(([address, value]) => (
                    <ValueCard
                      key={address}
                      name={`[${address}]`}
                      value={value}
                      changed={isChanged(currentCycle?.changedMemory, address)}
                    />
                  ))}
                </View>
              </View>
            )}

            <View style={styles.helpBox}>
              <Text style={styles.helpTitle}>How to read this?</Text>
              <Text style={styles.helpText}>
                Every T-state is one clock cycle. Fetch loads the instruction, Decode understands the operands, and Execute performs the action.
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CycleAnimationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1F3C88",
  },

  screen: {
    flex: 1,
    backgroundColor: "#EEF2F9",
  },

  header: {
    backgroundColor: "#1F3C88",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  headerTextBox: {
    flex: 1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#DDEBFF",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  content: {
    padding: 12,
    paddingBottom: 28,
  },

  summaryRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D7E3F7",
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 6,
  },

  summaryLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2,
  },

  summaryValue: {
    color: "#1F3C88",
    fontSize: 17,
    fontWeight: "900",
  },

  summaryStatus: {
    fontSize: 13,
    fontWeight: "900",
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7E3F7",
    padding: 12,
    marginBottom: 10,
  },

  mainTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  ringBox: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#F8FBFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  ring: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
  },

  bigT: {
    fontSize: 30,
    fontWeight: "900",
  },

  infoBox: {
    flex: 1,
  },

  stageBadge: {
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 9,
    marginBottom: 7,
  },

  stageText: {
    fontSize: 12,
    fontWeight: "900",
  },

  label: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2,
  },

  instructionText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },

  counterText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  microBox: {
    marginTop: 10,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  microText: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
  },

  progressBar: {
    height: 6,
    backgroundColor: "#DCE8FA",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },

  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  stepBackButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E3F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  playPauseButton: {
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1F3C88",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  playPauseText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },

  disabledControl: {
    opacity: 0.5,
  },

  timelineRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E3F7",
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },

  timelineItem: {
    width: 48,
    alignItems: "center",
    marginRight: 3,
  },

  timelineCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E2E8F0",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 3,
  },

  activeTimelineCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1F3C88",
    borderColor: "#8EC5FF",
  },

  timelineCircleText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#64748B",
  },

  timelineText: {
    fontSize: 8,
    color: "#64748B",
    fontWeight: "700",
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E3F7",
    padding: 10,
    marginBottom: 10,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginLeft: 6,
  },

  valuesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  valueCard: {
    width: "31.8%",
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#D7E3F7",
    paddingVertical: 7,
    paddingHorizontal: 5,
    alignItems: "center",
    marginRight: 5,
    marginBottom: 6,
  },

  flagCard: {
    backgroundColor: "#FBF8FF",
  },

  changedCard: {
    backgroundColor: "#ECFDF5",
    borderColor: "#22C55E",
  },

  valueName: {
    color: "#0F172A",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 3,
  },

  valueNumber: {
    color: "#0F2E75",
    fontSize: 14,
    fontWeight: "900",
  },

  changedText: {
    color: "#16A34A",
  },

  emptyText: {
    color: "#64748B",
    fontSize: 12,
  },

  helpBox: {
    backgroundColor: "#EEF6FF",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  helpTitle: {
    color: "#1F3C88",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
  },

  helpText: {
    color: "#334155",
    fontSize: 11,
    lineHeight: 16,
  },
});