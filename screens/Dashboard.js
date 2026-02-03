import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const Dashboard = ({ navigation }) => {
  const [data, setData] = useState([]); // holds list data
  const [loading, setLoading] = useState(true); // loading state

  // 🔹 Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Load data function (replace with API call later)
  const loadData = async () => {
    // Example API fetch (replace URL with your real API)
    // try {
    //   const response = await fetch("https://your-api.com/dashboard");
    //   const json = await response.json();
    //   setData(json);
    // } catch (error) {
    //   console.error(error);
    // }

    // For now, we use mock data
    const mockData = [
      { id: 1, title: "CPU Design", description: "Visualize CPU components", route: "CPU" },
      { id: 2, title: "Instruction Set", description: "Supported instructions", route: "Instruction" },
      { id: 3, title: "Registers", description: "Register visualization", route: "Registers" },
    ];

    setData(mockData);
    setLoading(false);
  };

  // 🔹 Handle item click
  const handleItemPress = (item) => {
    // Navigate to route (if using react-navigation)
    // navigation.navigate(item.route);

    // For now, just alert
    alert(`Clicked on ${item.title}`);
  };

  // 🔹 Render each FlatList item
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleItemPress(item)}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </TouchableOpacity>
  );

  // 🔹 Show loading spinner
  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2, // shadow for Android
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#0f172a",
  },
  desc: {
    fontSize: 14,
    color: "#475569",
  },
});
