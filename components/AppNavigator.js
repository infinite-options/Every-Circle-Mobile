import React from "react";
import { useNavigation } from "../contexts/NavigationContext";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AccountScreen from "../screens/AccountScreen";
import NetworkScreen from "../screens/NetworkScreen";
import SearchScreen from "../screens/SearchScreen";
import UserProfile from "../screens/UserProfile";

export default function AppNavigator({ onContinue, onEdit, onLogout }) {
  const { currentScreen } = useNavigation();

  // Render the appropriate screen based on currentScreen
  switch (currentScreen) {
    case "Profile":
      return <ProfileScreen />;
    case "Settings":
      return <SettingsScreen />;
    case "Account":
      return <AccountScreen />;
    case "Network":
      return <NetworkScreen />;
    case "Search":
      return <SearchScreen />;
    case "UserProfile":
      return <UserProfile onContinue={onContinue} onEdit={onEdit} />;
    default:
      return <ProfileScreen />;
  }
}
