import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function ConfigScreen() {
  const navigation = useNavigation();
  const [ipAddress, setIpAddress] = useState("192.168.1.105");
  const [port, setPort] = useState("8080");
  const [autoConnect, setAutoConnect] = useState(true);
  const [deviceName, setDeviceName] = useState("Graphite-ESP32");

  // Storage data (placeholder values)
  const totalStorage = 512; // In GB
  const usedStorage = 175.8;
  const remainingStorage = totalStorage - usedStorage;
  const usagePercentage = (usedStorage / totalStorage) * 100;

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.title}>ESP32 Configuration</Text>
        <TouchableOpacity>
          <Icon name="refresh-outline" size={24} style={styles.refreshIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.statusSection}>
          <View style={styles.statusIconContainer}>
            <Icon
              name={autoConnect ? "wifi" : "wifi-outline"}
              size={28}
              style={[
                styles.statusIcon,
                { color: autoConnect ? "#4CD964" : "#C9C9C9" },
              ]}
            />
          </View>
          <Text style={styles.statusText}>
            {autoConnect ? "Connected" : "Disconnected"}
          </Text>
        </View>

        <View style={styles.sectionSeparator} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Device Information</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Device Name</Text>
            <TextInput
              style={styles.infoInput}
              value={deviceName}
              onChangeText={setDeviceName}
              placeholder="Enter device name"
            />
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>IP Address</Text>
            <TextInput
              style={styles.infoInput}
              value={ipAddress}
              onChangeText={setIpAddress}
              placeholder="Enter IP address"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Port</Text>
            <TextInput
              style={styles.infoInput}
              value={port}
              onChangeText={setPort}
              placeholder="Enter port number"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Auto Connect</Text>
            <Switch
              trackColor={{ false: "#D1D1D6", true: "#4CD964" }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#D1D1D6"
              onValueChange={setAutoConnect}
              value={autoConnect}
            />
          </View>
        </View>

        <View style={styles.sectionSeparator} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Storage</Text>
        </View>

        <View style={styles.storageInfo}>
          <View style={styles.storageTextContainer}>
            <Text style={styles.storageMainText}>
              {remainingStorage.toFixed(1)} GB free
            </Text>
            <Text style={styles.storageSubText}>of {totalStorage} GB</Text>
          </View>

          <View style={styles.storageGraphContainer}>
            <View style={styles.storageBarBg}>
              <View
                style={[
                  styles.storageBarFill,
                  { width: `${usagePercentage}%` },
                ]}
              />
            </View>
            <View style={styles.storageDetails}>
              <Text style={styles.storageUsedText}>
                {usedStorage.toFixed(1)} GB used
              </Text>
              <Text style={styles.storagePercentText}>
                {usagePercentage.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset Device</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionSeparator} />
      </View>

      <View style={styles.systemInfoContainer}>
        <View style={styles.systemInfo}>
          <Text style={styles.systemInfoText}>Device ID: ESP32-78A4DF</Text>
          <Text style={styles.systemInfoText}>
            Last Connected: Today, 10:45 AM
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    color: "black",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  refreshIcon: {
    color: "black",
  },
  contentContainer: {
    backgroundColor: "white",
  },
  statusSection: {
    alignItems: "center",
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "center",
  },
  statusIconContainer: {
    marginRight: 10,
  },
  statusIcon: {
    alignSelf: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "500",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  infoSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: {
    fontSize: 16,
    color: "#333",
  },
  infoInput: {
    fontSize: 16,
    color: "#007AFF",
    textAlign: "right",
    minWidth: 150,
  },
  storageInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  storageTextContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 15,
  },
  storageMainText: {
    fontSize: 20,
    fontWeight: "600",
    marginRight: 8,
  },
  storageSubText: {
    fontSize: 14,
    color: "#666",
  },
  storageGraphContainer: {
    width: "100%",
  },
  storageBarBg: {
    height: 8,
    backgroundColor: "#E9E9E9",
    borderRadius: 4,
    overflow: "hidden",
  },
  storageBarFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  storageDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  storageUsedText: {
    fontSize: 14,
    color: "#666",
  },
  storagePercentText: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  connectButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  connectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  resetButton: {
    backgroundColor: "#F2F2F2",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  resetButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  systemInfoContainer: {
    flex: 1, // This makes it fill the remaining space
    backgroundColor: "#f9f9f9", // Grey background
  },
  systemInfo: {
    padding: 20,
  },
  systemInfoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  sectionSeparator: {
    height: 10,
    backgroundColor: "#f2f2f2",
  },
});
