import React, { useEffect, useState, useRef } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import ContactsTabs from "./src/page/contacts/ContactsTabs";
import DiscoveryTabs from "./src/page/Discovery/DiscoveryTabs";
import LogTabs from "./src/page/log/LogTabs";
import PersonalTabs from "./src/page/personal/PersonalTabs";
import ChatTab from "./src/page/chat/ChatTab";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginForm from "./src/page/auth/login";
import { store } from "./src/redux/store";
import { Provider, useSelector, useDispatch } from "react-redux";
import { doGetAccount } from "./src/redux/authSlice";
import RegisterForm from "./src/page/auth/register";
import InboxScreen from "./src/page/chat/InboxScreen";
import PersonOption from "./src/page/chat/PersonOption";
import GroupOption from "./src/page/chat/GroupOption";
import ResetPassword from "./src/page/auth/ResetPassword";
import ChangePassword from "./src/component/changePassword";
import Setting from "./src/page/personal/Setting";
import InformationAccount from "./src/page/personal/InfomationAccount";
import FriendRequest from "./src/page/contacts/FriendRequest";
import io from "socket.io-client";
import ManageGroup from "./src/page/auth/ManageGroup";
import AddFriendScreen from "./src/page/chat/AddFriendScreen";
import SearchScreen from "./src/page/chat/SearchScreen";
import UserProfileScreen from "./src/page/personal/UserProfileScreen";
import CreateGroupTab from "./src/page/chat/CreateGroupTab";
import VideoCallModal from "./src/component/VideoCallModal";
import MediaFilesLinksScreen from "./src/page/chat/MediaFilesLinksScreen";
import MediaViewer from "./src/page/chat/MediaViewer";
import GroupRequest from "./src/page/contacts/GroupRequest";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = ({ route }) => (
  <View style={{ flex: 1 }}>
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
      <Tab.Screen
        name="Tin nhắn"
        component={ChatTab}
        initialParams={{ socketRef: route.params.socketRef }}
      />
      <Tab.Screen
        name="Danh bạ"
        component={ContactsTabs}
        initialParams={{ socketRef: route.params.socketRef }}
      />
      <Tab.Screen
        name="Khám phá"
        component={DiscoveryTabs}
        initialParams={{ socketRef: route.params.socketRef }}
      />
      <Tab.Screen
        name="Nhật ký"
        component={LogTabs}
        initialParams={{ socketRef: route.params.socketRef }}
      />
      <Tab.Screen
        name="Cá nhân"
        component={PersonalTabs}
        initialParams={{ socketRef: route.params.socketRef }}
      />
    </Tab.Navigator>
  </View>
);

const Project = () => {
  const dispatch = useDispatch();
  let isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.user);

  // Trạng thái cuộc gọi
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [receiver, setReceiver] = useState(null);
  const [jitsiUrl, setJitsiUrl] = useState(null);

  const fetchDataAccount = async () => {
    if (!user || !user?.access_Token) {
      await dispatch(doGetAccount());
    }
  };

  useEffect(() => {
    fetchDataAccount();
  }, [dispatch, user?.access_Token]);

  // connect socket -> cmd(IPv4 Address): ipconfig
  const socketRef = useRef();

  const IPv4 = "localhost";
  useEffect(() => {
    const socket = io.connect(`http://${IPv4}:8080`);
    socketRef.current = socket;
  }, []);

  // action socket
  useEffect(() => {
    if (user && user._id && socketRef.current) {
      socketRef.current.emit("register", user._id);
    }

    socketRef.current.on("RES_CALL", (from, to) => {
      setIncomingCall(from);
      setReceiver(to);

      const members = to.members || [];
      const membersString = members.join("-");
      setJitsiUrl(`https://meet.jit.si/${membersString}`);
    });

    socketRef.current.on("RES_END_CALL", () => {
      setIsCalling(false);
      setIncomingCall(null);
      setIsInitiator(false);
      setReceiver(null);
    });
  }, [user]);

  // Hàm xử lý cuộc gọi
  const handleStartCall = (caller, callee) => {
    setIsCalling(true);
    setIsInitiator(true);
    setReceiver(callee);
    socketRef.current.emit("REQ_CALL", caller, callee);
  };

  const acceptCall = () => {
    setIsCalling(true);
    setIncomingCall(null);
  };

  const endCall = () => {
    socketRef.current.emit("REQ_END_CALL", user, receiver);
    setIsCalling(false);
    setIncomingCall(null);
    setIsInitiator(false);
    setReceiver(null);
  };

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Navigator>
          {isLoggedIn ? (
            <>
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                initialParams={{ socketRef, handleStartCall }}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SearchScreen"
                component={SearchScreen}
                options={{ headerShown: false }}
                initialParams={{ socketRef }}
              />
              <Stack.Screen
                name="AddFriendScreen"
                component={AddFriendScreen}
                options={{ headerShown: false }}
                initialParams={{ socketRef }}
              />
              <Stack.Screen
                name="CreateGroupTab"
                component={CreateGroupTab}
                options={{ headerShown: false }}
                initialParams={{ socketRef }}
              />
              <Stack.Screen
                name="UserProfileScreen"
                component={UserProfileScreen}
                options={{ headerShown: false }}
                initialParams={{ socketRef }}
              />
              <Stack.Screen
                name="InboxScreen"
                component={InboxScreen}
                options={{ headerShown: false }}
                initialParams={{
                  socketRef,
                  handleStartCall,
                }}
              />
              <Stack.Screen
                name="PersonOption"
                component={PersonOption}
                options={{ headerShown: false }}
                initialParams={{ socketRef }}
              />
              <Stack.Screen
                name="GroupOption"
                component={GroupOption}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="MediaFilesLinksScreen"
                component={MediaFilesLinksScreen}
                options={{
                  headerTitle: "Ảnh, video, file, link", // Đặt tiêu đề cho header
                  headerShown: true, // Hiển thị header nếu chưa được bật
                }}
              />
              <Stack.Screen
                name="MediaViewer"
                component={MediaViewer}
                options={{
                  headerTitle: "Xem chi tiết",
                  headerShown: true,
                }}
              />

              <Stack.Screen
                name="ChangePassword"
                component={ChangePassword}
              />
              <Stack.Screen name="Setting" component={Setting} />
              <Stack.Screen
                name="InformationAccount"
                component={InformationAccount}
                initialParams={{ socketRef }}
              />
              <Stack.Screen
                name="ManageGroup"
                component={ManageGroup}
                options={{ headerShown: false }}
                initialParams={{ socketRef }}
              />
              <Stack.Screen
                name="FriendRequest"
                component={FriendRequest}
                initialParams={{ socketRef }}
              />
              <Stack.Screen
                name="GroupRequest"
                component={GroupRequest}
                initialParams={{ socketRef }}
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
      </SafeAreaView>

      {!isInitiator && incomingCall && (
        <View style={styles.centeredOverlay}>
          <View style={styles.callNotification}>
            <Text style={styles.callText}>
              {incomingCall.username} đang gọi bạn...
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.rejectButton} onPress={endCall}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={acceptCall}
              >
                <Text style={styles.buttonText}>Chấp nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {isCalling && (
        <VideoCallModal
          show={isCalling}
          onHide={endCall}
          jitsiUrl={jitsiUrl}
          socketRef={socketRef}
          isInitiator={isInitiator}
        />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <Project />
    </Provider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  centeredOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // nếu bạn muốn nền mờ
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  callNotification: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
    width: "80%",
  },
  callText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  rejectButton: {
    backgroundColor: "#f44336",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
