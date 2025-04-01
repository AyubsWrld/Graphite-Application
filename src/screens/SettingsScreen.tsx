import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../App";
type Props = NativeStackScreenProps<AuthStackParamList, 'Settings'>;

export function SettingsScreen({ navigation } : Props ) {

  // Handler for back button
  const handleBackPress = () => {
    navigation.goBack();
  };

  const navigateToConfigScreen = () => {
    navigation.navigate("ConfigScreen");
  };

  const navigateToMyDetailsScreen = () => {
    navigation.navigate("MyDetailsScreen");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.title}>Account</Text>
        <TouchableOpacity>
          <Icon
            name="notifications-outline"
            size={24}
            style={styles.notificationIcon}
          />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={navigateToConfigScreen}>
          <Icon name="cube-outline" size={22} style={styles.menuIcon} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>ESP32 Configuration</Text>
          </View>

          <Icon name="chevron-forward" size={22} style={styles.arrowIcon} />
        </TouchableOpacity>
        <View style={styles.sectionSeparator} />
        <TouchableOpacity
          style={styles.menuItem}
          onPress={navigateToMyDetailsScreen}>
          <Icon name="person-outline" size={22} style={styles.menuIcon} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>My Details</Text>
          </View>
          <Icon name="chevron-forward" size={22} style={styles.arrowIcon} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={ () => navigation.navigate("Home", { screen: "Config" })}
        >
          <Icon name="wifi-outline" size={22} style={styles.menuIcon} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Wifi Configuration</Text>
          </View>
          <Icon name="chevron-forward" size={22} style={styles.arrowIcon} />
        </TouchableOpacity>
        <View style={styles.sectionSeparator} />
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="help-circle-outline" size={22} style={styles.menuIcon} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>FAQs</Text>
          </View>
          <Icon name="chevron-forward" size={22} style={styles.arrowIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="headset-outline" size={22} style={styles.menuIcon} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Help Center</Text>
          </View>
          <Icon name="chevron-forward" size={22} style={styles.arrowIcon} />
        </TouchableOpacity>
        <View style={styles.sectionSeparator} />
        <TouchableOpacity style={styles.logoutItem}>
          <Icon name="log-out-outline" size={22} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
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
  notificationIcon: {
    color: "black",
  },
  menuContainer: {
    marginTop: 0,
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
  sectionSeparator: {
    height: 10,
    backgroundColor: "#f2f2f2",
  },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  logoutIcon: {
    marginRight: 15,
    color: "red",
  },
  logoutText: {
    fontSize: 16,
    color: "red",
  },
});
