import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { MenuProvider } from "react-native-popup-menu";
import ContactsTabs from "./src/page/contacts/ContactsTabs";
import DiscoveryTabs from "./src/page/Discovery/DiscoveryTabs";
import LogTabs from "./src/page/log/LogTabs";
import PersonalTabs from "./src/page/personal/PersonalTabs";
import SearchHeader from "./src/component/Header";
import ChatTab from "./src/page/chat/ChatTab";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginForm from "./src/page/auth/login";
import { store } from "./src/redux/store";
import { Provider } from "react-redux";
import { useSelector, useDispatch } from "react-redux";
import { doGetAccount } from "./src/redux/authSlice";
import RegisterForm from "./src/page/auth/register";
import InboxScreen from "./src/page/chat/InboxScreen";
import PersonOption from "./src/page/chat/PersonOption";
import ResetPassword from "./src/page/auth/ResetPassword";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
      <Tab.Screen name="Tin nhắn" component={ChatTab} />
      <Tab.Screen name="Danh bạ" component={ContactsTabs} />
      <Tab.Screen name="Khám phá" component={DiscoveryTabs} />
      <Tab.Screen name="Nhật ký" component={LogTabs} />
      <Tab.Screen name="Cá nhân" component={PersonalTabs} />
    </Tab.Navigator>
  </View>
);

const Project = () => {
  const dispatch = useDispatch();
  let isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.user);

  const fetchDataAccount = async () => {
    if (!user || !user?.access_Token) {
      await dispatch(doGetAccount()); // Gọi API
    }
  };

  useEffect(() => {
    fetchDataAccount();
  }, [dispatch, user?.access_Token]);

  return (
    <MenuProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {isLoggedIn ? (
            <>
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="InboxScreen"
                component={InboxScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PersonOption"
                component={PersonOption}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={LoginForm}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Register"
                component={RegisterForm}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="ResetPassword"
                component={ResetPassword}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </MenuProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <Project />
    </Provider>
  );
}
