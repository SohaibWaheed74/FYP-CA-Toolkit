// DashBoard.js
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const dummyData = [
  { id: '1', name: 'Architecture1', memory: '128 Bytes', bus: '8 bits' },
  { id: '2', name: 'Architecture2', memory: '64 Bytes', bus: '8 bits' },
  { id: '3', name: 'Architecture3', memory: '256 Bytes', bus: '8 bits' },
];

const DashBoard = ({ navigation }) => {

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="hardware-chip-outline" size={20} color="#333" />
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      <Text style={styles.cardText}>Memory: {item.memory}</Text>
      <Text style={styles.cardText}>Bus: {item.bus}</Text>

      <View style={styles.cardButtons}>
        <TouchableOpacity style={styles.useButton}>
          <Text style={styles.buttonText}>Use</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.buttonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Architectures</Text>
      <Text style={styles.subHeader}>Manage and explore your computer architecture designs</Text>

      <FlatList
        data={dummyData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default DashBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  cardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  useButton: {
    flex: 1,
    backgroundColor: '#1e40af',
    padding: 8,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#60a5fa',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
