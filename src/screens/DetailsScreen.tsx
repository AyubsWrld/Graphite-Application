import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";



type Props = NativeStackScreenProps<AppStackParamList, "Home">;

export default function Details( { route , navigation } : Props ) {

  // User details state
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleBackPress = () => {
    navigation.navigate("SettingsScreen");
  };

  const handleSavePress = () => {

    navigation.navigate("SettingsScreen");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.title}>My Details</Text>
        <TouchableOpacity onPress={handleSavePress}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.profileSection}>
          <View style={styles.profilePicture}>
            <Text style={styles.profileInitials}>
              {firstName.charAt(0)}
              {lastName.charAt(0)}
            </Text>
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>First Name</Text>
          <TextInput
            style={styles.infoInput}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
          />
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Name</Text>
          <TextInput
            style={styles.infoInput}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
          />
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <TextInput
            style={styles.infoInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.sectionSeparator} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Security</Text>
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="lock-closed-outline" size={22} style={styles.menuIcon} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Change Password</Text>
          </View>
          <Icon name="chevron-forward" size={22} style={styles.arrowIcon} />
        </TouchableOpacity>

        <View style={styles.sectionSeparator} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Enable Notifications</Text>
          <Switch
            trackColor={{ false: "#D1D1D6", true: "#4CD964" }}
            thumbColor={"#FFFFFF"}
            ios_backgroundColor="#D1D1D6"
            onValueChange={setNotificationsEnabled}
            value={notificationsEnabled}
          />
        </View>

        <View style={styles.sectionSeparator} />

        <TouchableOpacity style={styles.deleteAccountContainer}>
          <Text style={styles.deleteAccountText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
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
  saveButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  changePhotoButton: {
    paddingVertical: 1,
  },
  changePhotoText: {
    fontSize: 16,
    color: "#007AFF",
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
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    fontSize: 16,
    color: "#007AFF",
    textAlign: "right",
    minWidth: 120,
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  sectionSeparator: {
    height: 10,
    backgroundColor: "#f2f2f2",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuIcon: {
    marginRight: 15,
    color: "black",
  },
  menuText: {
    fontSize: 16,
  },
  arrowIcon: {
    color: "#C9C9C9",
  },
  deleteAccountContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  deleteAccountText: {
    fontSize: 16,
    color: "red",
  },
});
