import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import ChatScreen from "./ChatScreen";
import FriendScreen from "./FriendScreen";
import GroupScreen from "./GroupScreen";
import SearchScreen from "./SearchScreen"

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer initialRouteName="ChatScreen">
      <Stack.Navigator>
       <Stack.Screen name="FriendScreen" component={FriendScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GroupScreen" component={GroupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
