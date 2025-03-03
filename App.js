import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./src/page/auth/login";
import Chat from "./src/page/chat/Chat";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return <Project />;
}

const Project = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Chat">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ header: () => {} }}
        />

        <Stack.Screen
          name="Chat"
          component={Chat}
          options={{ header: () => {} }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
