import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { ArchitectureContext } from "../context/ArchitectureContext";

const CODE_SEGMENT_LIMIT = 50;

// Sir requirement:
// 1 Word = 16 bits
// So every memory address row will show 16 bit columns.
const WORD_SIZE = 16;

// true = blocks ke andar 0/1 show hoga
// false = sirf circles show hongy
const SHOW_BIT_TEXT = false;

const MemoryVisualization = () => {
  const {
    memoryBits,
    memorySize,
    stackValues,
    stackSize,
    stackPointer,
    instructionDetails,
    latestExecutionResult,
  } = useContext(ArchitectureContext);

  // ================= CURRENT WORD-WISE MODE =================
  // Default memory display is word-wise.
  // 1 row = 1 word = 16 bit columns.
  const [viewOptions, setViewOptions] = useState({
    bitsPerRow: WORD_SIZE,
    rowsMode: "full",
  });

  /*
    ================= 4/8/WORD RADIO GUIDE =================

    Current default:
    bitsPerRow: WORD_SIZE
    This means default selected option is "Word 16".

    If you want 4-bit or 8-bit radio buttons:
    Go to the JSX radio group below and uncomment 4 Bits / 8 Bits buttons.

    4 Bits = 16-bit word will be shown as 4 bits per line.
    8 Bits = 16-bit word will be shown as 8 bits per line.
    Word 16 = full 16-bit word in one row.
  */

  const bitsPerRow = viewOptions.bitsPerRow;
  const rowsMode = viewOptions.rowsMode;

  const setBitsPerRow = (value) => {
    setViewOptions((prev) => ({
      ...prev,
      bitsPerRow: value,
    }));
  };

  const setRowsMode = (value) => {
    setViewOptions((prev) => ({
      ...prev,
      rowsMode: value,
    }));
  };

  const safeMemoryBits = Array.isArray(memoryBits) ? memoryBits : [];
  const safeStackValues = Array.isArray(stackValues) ? stackValues : [];

  const memorySummary =
    latestExecutionResult?.MemorySummary ||
    latestExecutionResult?.memorySummary ||
    {};

  const totalStackSize =
    Number(stackSize) > 0
      ? Number(stackSize)
      : safeStackValues.length > 0
      ? safeStackValues.length
      : 16;

  const displayStackValues =
    safeStackValues.length > 0
      ? safeStackValues
      : Array.from({ length: totalStackSize }, () => "");

  const memorySizeNumber = Number(memorySize) || 0;

  const totalWords =
    memorySizeNumber > 0 ? Math.ceil(memorySizeNumber / 2) : 0;

  const allCodeRows = Array.from(
    { length: CODE_SEGMENT_LIMIT },
    (_, index) => index
  );

  const dataAddressesFromSummary = Object.keys(memorySummary)
    .map((address) => Number(address))
    .filter(
      (address) => !Number.isNaN(address) && address >= CODE_SEGMENT_LIMIT
    )
    .sort((a, b) => a - b);

  const dataRowsFromMemorySize =
    memorySizeNumber > CODE_SEGMENT_LIMIT
      ? Array.from(
          { length: memorySizeNumber - CODE_SEGMENT_LIMIT },
          (_, index) => CODE_SEGMENT_LIMIT + index
        )
      : [];

  const allDataRows = Array.from(
    new Set([...dataRowsFromMemorySize, ...dataAddressesFromSummary])
  ).sort((a, b) => a - b);

  const getVisibleRows = (rows) => {
    if (rowsMode === "full") return rows;

    const limit = Number(rowsMode) || rows.length;
    return rows.slice(0, limit);
  };

  const codeRows = getVisibleRows(allCodeRows);
  const dataRows = getVisibleRows(allDataRows);

  const getAddressLabel = (address) => {
    return `0x${address.toString(16).toUpperCase().padStart(2, "0")}`;
  };

  // ================= CONVERT NUMBER TO 16-BIT WORD =================
  const numberToBitArray = (value) => {
    const num = Number(value) || 0;

    const maxValue = Math.pow(2, WORD_SIZE);

    const wordValue =
      num >= 0
        ? num % maxValue
        : ((num % maxValue) + maxValue) % maxValue;

    return Array.from({ length: WORD_SIZE }, (_, index) => {
      const bitPosition = WORD_SIZE - 1 - index;
      return (wordValue >> bitPosition) & 1;
    });
  };

  /*
    ================= OLD 8-BIT FUNCTION GUIDE =================

    If sir asks to show byte-wise memory again,
    you can replace numberToBitArray with this old function:

    const numberToBitArray = (value) => {
      const num = Number(value) || 0;

      if (num >= 0) {
        const binary = num.toString(2);

        if (binary.length <= 8) {
          return binary.padStart(8, "0").split("").map(Number);
        }

        return binary.split("").map(Number);
      }

      const byteValue = ((num % 256) + 256) % 256;

      return Array.from({ length: 8 }, (_, index) => {
        const bitPosition = 7 - index;
        return (byteValue >> bitPosition) & 1;
      });
    };
  */

  // ================= IMPORTANT FIX =================
  // memoryBits from context can still come as 8 bits.
  // This function converts every row into 16-bit word.
  const normalizeBitsToWord = (bits = []) => {
    if (!Array.isArray(bits)) {
      return Array.from({ length: WORD_SIZE }, () => 0);
    }

    const cleanedBits = bits.map((bit) => (Number(bit) === 1 ? 1 : 0));

    if (cleanedBits.length === WORD_SIZE) {
      return cleanedBits;
    }

    if (cleanedBits.length < WORD_SIZE) {
      return [
        ...Array.from({ length: WORD_SIZE - cleanedBits.length }, () => 0),
        ...cleanedBits,
      ];
    }

    return cleanedBits.slice(cleanedBits.length - WORD_SIZE);
  };

  const getMemoryRowBits = (address) => {
    if (address >= CODE_SEGMENT_LIMIT && memorySummary[address] !== undefined) {
      return numberToBitArray(memorySummary[address]);
    }

    if (
      address >= CODE_SEGMENT_LIMIT &&
      memorySummary[String(address)] !== undefined
    ) {
      return numberToBitArray(memorySummary[String(address)]);
    }

    const rowBits = safeMemoryBits[address];

    if (Array.isArray(rowBits)) {
      return normalizeBitsToWord(rowBits);
    }

    return Array.from({ length: WORD_SIZE }, () => 0);

    /*
      OLD BYTE-WISE EMPTY ROW:
      return Array.from({ length: 8 }, () => 0);
    */
  };

  const chunkBits = (bits, chunkSize) => {
    const chunks = [];

    for (let i = 0; i < bits.length; i += chunkSize) {
      chunks.push(bits.slice(i, i + chunkSize));
    }

    return chunks;
  };

  const renderBitCircle = (bit, key) => {
    const bitValue = Number(bit) === 1 ? 1 : 0;
    const isOne = bitValue === 1;

    return (
      <View
        key={key}
        style={[
          styles.memoryCell,
          isOne ? styles.bitOneCell : styles.bitZeroCell,
        ]}
      >
        {SHOW_BIT_TEXT && (
          <Text
            style={[
              styles.bitText,
              isOne ? styles.bitOneText : styles.bitZeroText,
            ]}
          >
            {bitValue}
          </Text>
        )}
      </View>
    );
  };

  const renderSegmentHeader = (title) => {
    return (
      <View style={styles.segmentHeader}>
        <Text style={styles.segmentHeaderText}>{title}</Text>
      </View>
    );
  };

  const renderRadioButton = (label, active, onPress) => {
    return (
      <TouchableOpacity style={styles.radioOption} onPress={onPress}>
        <View style={styles.radioOuter}>
          {active && <View style={styles.radioInner} />}
        </View>

        <Text style={styles.radioText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderMemoryAddressRow = (address, isCodeSegment) => {
    const rowBits = getMemoryRowBits(address);

    /*
      CURRENT WORD MODE:
      1 address row = 16 bits.

      4 Bits mode:
      16-bit word will be split into 4 lines.

      8 Bits mode:
      16-bit word will be split into 2 lines.

      Word 16 mode:
      16-bit word will show in one line.
    */
    const bitRows = chunkBits(rowBits, bitsPerRow);

    return (
      <View key={address} style={styles.addressBlock}>
        {bitRows.map((bitRow, rowIndex) => (
          <View key={`${address}-${rowIndex}`} style={styles.memoryRow}>
            <Text
              style={[
                styles.addressText,
                isCodeSegment && styles.codeAddressText,
              ]}
            >
              {rowIndex === 0 ? getAddressLabel(address) : ""}
            </Text>

            <View style={styles.memoryGrid}>
              {bitRow.map((bit, bitIndex) =>
                renderBitCircle(bit, `${address}-${rowIndex}-${bitIndex}`)
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMemoryRows = () => {
    if (!safeMemoryBits || safeMemoryBits.length === 0) {
      return (
        <Text style={styles.emptyText}>
          Please press Use on an architecture first.
        </Text>
      );
    }

    return (
      <>
        {renderSegmentHeader(
          `CODE SEGMENT - Instruction Format 0 to ${CODE_SEGMENT_LIMIT - 1}`
        )}

        {codeRows.map((address) => renderMemoryAddressRow(address, true))}

        {rowsMode !== "full" && allCodeRows.length > codeRows.length && (
          <Text style={styles.moreText}>
            Showing first {rowsMode} code rows only
          </Text>
        )}

        {renderSegmentHeader(
          `DATA SEGMENT - Memory Address ${CODE_SEGMENT_LIMIT}+`
        )}

        {dataRows.length > 0 ? (
          dataRows.map((address) => renderMemoryAddressRow(address, false))
        ) : (
          <Text style={styles.emptyText}>
            No data memory found. Use Store [{CODE_SEGMENT_LIMIT}],R1 or higher
            address.
          </Text>
        )}

        {rowsMode !== "full" && allDataRows.length > dataRows.length && (
          <Text style={styles.moreText}>
            Showing first {rowsMode} data rows only
          </Text>
        )}
      </>
    );
  };

  const renderStack = () => {
    const rows = Array.from({ length: totalStackSize }, (_, index) => {
      return totalStackSize - 1 - index;
    });

    return rows.map((stackIndex) => {
      const pointer = Number(stackPointer) || 0;
      const topValueIndex = pointer - 1;

      const isStackPointer = stackIndex === topValueIndex;

      const hasData =
        stackIndex >= 0 &&
        stackIndex < pointer &&
        displayStackValues[stackIndex] !== "" &&
        displayStackValues[stackIndex] !== null &&
        displayStackValues[stackIndex] !== undefined;

      return (
        <View key={stackIndex} style={styles.stackRow}>
          <Text style={styles.stackIndex}>{stackIndex}</Text>

          <View
            style={[
              styles.stackInput,
              isStackPointer && styles.stackInputActive,
            ]}
          >
            <Text style={styles.stackValue}>
              {hasData ? String(displayStackValues[stackIndex]) : ""}
            </Text>
          </View>

          <View style={styles.spColumn}>
            <Text style={isStackPointer ? styles.spText : styles.spHidden}>
              {isStackPointer ? "← SP" : ""}
            </Text>
          </View>
        </View>
      );
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Memory Visualization</Text>

      <View style={styles.topControlsCard}>
        <View style={styles.controlSection}>
          {/* <Text style={styles.controlTitle}>Bit Columns</Text> */}

          <View style={styles.radioGroupWrap}>
            {/*
              ================= HIDE / SHOW GUIDE =================

              Currently 4 Bits and 8 Bits are commented.
              So only Word 16 will show.

              If you want to show 4/8 again:
              Just uncomment these two buttons.
              No other code change is needed.
            */}

            {/* 
            {renderRadioButton("4 Bits", bitsPerRow === 4, () =>
              setBitsPerRow(4)
            )}

            {renderRadioButton("8 Bits", bitsPerRow === 8, () =>
              setBitsPerRow(8)
            )}
            */}

            {/* {renderRadioButton("Word 16", bitsPerRow === WORD_SIZE, () =>
              setBitsPerRow(WORD_SIZE)
            )} */}
          </View>
        </View>

        {/* <View style={styles.controlSection}>
          <Text style={styles.controlTitle}>Rows</Text>

          <View style={styles.radioGroupWrap}>
            {renderRadioButton("4 Rows", rowsMode === "4", () =>
              setRowsMode("4")
            )}

            {renderRadioButton("8 Rows", rowsMode === "8", () =>
              setRowsMode("8")
            )}

            {renderRadioButton("Full", rowsMode === "full", () =>
              setRowsMode("full")
            )}
          </View>
        </View> */}
      </View>

      <View style={styles.memoryHeaderRow}>
        <Text style={styles.sectionTitle}>Memory Values</Text>
      </View>

      <View style={styles.card}>
        {renderMemoryRows()}

        {Number(memorySize) > 0 && (
          <Text style={styles.memorySizeText}>
            Total Memory: {memorySize} Bytes = {totalWords} Words
          </Text>
        )}

        <Text style={styles.memorySizeText}>
          Instruction Formats: {instructionDetails?.length || 0}
        </Text>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.blueBox]} />
            <Text style={styles.legendText}>Bit = 1</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.whiteBox]} />
            <Text style={styles.legendText}>Bit = 0</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Stack Memory</Text>

      <Text style={styles.subText}>
        Stack size and stack pointer are coming from backend
      </Text>

      <View style={styles.stackWrapper}>
        <View style={styles.stackCard}>{renderStack()}</View>
      </View>
    </ScrollView>
  );
};

export default MemoryVisualization;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    paddingHorizontal: 15,
    paddingTop: 20,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1e3a8a",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  subText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
  },

  topControlsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dbe4f0",
  },

  controlSection: {
    marginBottom: 10,
  },

  controlTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 6,
  },

  wordInfoBox: {
    backgroundColor: "rgba(30,58,138,0.08)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  wordInfoText: {
    fontSize: 12,
    color: "#1e3a8a",
    fontWeight: "700",
  },

  memoryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  radioGroupWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    marginBottom: 6,
  },

  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#1e3a8a",
  },

  radioText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#1e3a8a",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#e9edf3",
    borderRadius: 12,
    padding: 12,
    marginBottom: 25,
    overflow: "visible",
  },

  segmentHeader: {
    backgroundColor: "rgba(30,58,138,0.08)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 8,
  },

  segmentHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1e3a8a",
    letterSpacing: 0.6,
  },

  addressBlock: {
    marginBottom: 8,
  },

  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  // addressText: {
  //   width: 45,
  //   fontSize: 11,
  //   color: "#333",
  //   fontWeight: "600",
  // },
  addressText: {
  width: 40,
  fontSize: 10,
  color: "#333",
  fontWeight: "600",
},

  codeAddressText: {
    color: "#1e3a8a",
    fontWeight: "800",
  },

  // memoryGrid: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   flexWrap: "wrap",
  //   flex: 1,
  // },

  // memoryCell: {
  //   width: 17,
  //   height: 17,
  //   borderRadius: 9,
  //   borderWidth: 1.1,
  //   borderColor: "#1e3a8a",
  //   marginHorizontal: 2,
  //   marginVertical: 2,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  memoryGrid: {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "nowrap",
  flexShrink: 0,
},

memoryCell: {
  width: 12,
  height: 12,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "#1e3a8a",
  marginHorizontal: 1,
  marginVertical: 1,
  alignItems: "center",
  justifyContent: "center",
},

  bitOneCell: {
    backgroundColor: "#1e3a8a",
  },

  bitZeroCell: {
    backgroundColor: "#FFFFFF",
  },

  bitText: {
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },

  bitOneText: {
    color: "#FFFFFF",
  },

  bitZeroText: {
    color: "#1e3a8a",
  },

  emptyText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    paddingVertical: 20,
  },

  moreText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 10,
    fontStyle: "italic",
  },

  memorySizeText: {
    marginTop: 10,
    fontSize: 12,
    color: "#1e3a8a",
    fontWeight: "600",
    textAlign: "center",
  },

  stackWrapper: {
    alignItems: "center",
    marginTop: 10,
  },

  stackCard: {
    backgroundColor: "#e9edf3",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: "82%",
    marginBottom: 25,
  },

  stackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  stackIndex: {
    width: 30,
    fontSize: 13,
    color: "#333",
    textAlign: "right",
    marginRight: 8,
  },

  stackInput: {
    width: 110,
    height: 36,
    borderWidth: 1,
    borderColor: "#b0c4de",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  stackInputActive: {
    borderWidth: 2,
    borderColor: "#1e3a8a",
  },

  stackValue: {
    color: "#1e3a8a",
    fontSize: 14,
    fontWeight: "700",
  },

  spColumn: {
    width: 55,
    marginLeft: 6,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  spText: {
    fontSize: 12,
    color: "#1e3a8a",
    fontWeight: "800",
    textAlign: "center",
  },

  spHidden: {
    fontSize: 12,
    color: "transparent",
    fontWeight: "700",
    textAlign: "center",
    opacity: 0,
  },

  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
    gap: 20,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#1E3A8A",
  },

  blueBox: {
    backgroundColor: "#1E3A8A",
  },

  whiteBox: {
    backgroundColor: "#FFFFFF",
  },

  legendText: {
    fontSize: 12,
    color: "#1E293B",
    fontWeight: "500",
  },
});