import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import Chat from "./src/page/ChatNghiem/Chat";
import ContactsTabs from "./src/page/contacts/ContactsTabs";
import DiscoveryTabs from "./src/page/Discovery/DiscoveryTabs";
import LogTabs from "./src/page/log/LogTabs";
import PersonalTabs from "./src/page/personal/PersonalTabs";
import SearchHeader from "./src/component/Header";

const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <View style={{ flex: 1 }}>
    <SearchHeader />
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            "Tin nhắn": focused
              ? "chatbubble-ellipses"
              : "chatbubble-ellipses-outline",
            "Danh bạ": focused ? "id-card" : "id-card-outline",
            "Khám phá": focused ? "grid" : "grid-outline",
            "Nhật ký": focused ? "time" : "time-outline",
            "Cá nhân": focused ? "person" : "person-outline",
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Tin nhắn" component={Chat} />
      <Tab.Screen name="Danh bạ" component={ContactsTabs} />
      <Tab.Screen name="Khám phá" component={DiscoveryTabs} />
      <Tab.Screen name="Nhật ký" component={LogTabs} />
      <Tab.Screen name="Cá nhân" component={PersonalTabs} />
    </Tab.Navigator>
  </View>
);

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar />
      <MainTabs />
    </NavigationContainer>
  );
}
