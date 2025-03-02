import React from "react";
import { View, Text, TextInput, FlatList, StatusBar, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

// Component Header có thanh tìm kiếm
const SearchHeader = () => (
  <View style={{ padding: 10, backgroundColor: "#2196F3", flexDirection: "row", alignItems: "center" }}>
    <Icon name={"search"} size={18} color={"#fff"} />
    <TextInput
      placeholder="Tìm kiếm"
      placeholderTextColor="#fff"
      style={{
        width: "40%",
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 40,
        marginRight: 20,
      }}
    />
    <Icon name="qr-code" size={24} color={"#fff"} marginRight={10} />
    <Icon name="person-add-outline" size={24} color={"#fff"} marginRight={10} />
    <Icon name="notifications-outline" size={24} color={"#fff"} marginRight={10} />
    <Icon name="settings-outline" size={24} color={"#fff"} marginRight={10} />
    <Icon name="image-outline" size={24} color={"#fff"} marginRight={10} />
    <Icon name={"add"} size={32} color={"#fff"} marginRight={10} />
  </View>
);

const friends = [
  { id: "1", name: "Bò Đực", avatar: require("./assets/favicon.png") },
  { id: "2", name: "A An", avatar: require("./assets/favicon.png") },
  { id: "3", name: "Anh Khoa", avatar: require("./assets/favicon.png") },
  { id: "4", name: "Anh Quân", avatar: require("./assets/favicon.png") },
  { id: "5", name: "Bà", avatar: require("./assets/favicon.png") },
  { id: "6", name: "Bà Ngoại", avatar: require("./assets/favicon.png") },
  { id: "7", name: "Bác", avatar: require("./assets/favicon.png") },
  { id: "8", name: "Bác Hồ", avatar: require("./assets/favicon.png") },
  { id: "9", name: "Bác Sĩ", avatar: require("./assets/favicon.png") },
  { id: "10", name: "Bác Tài", avatar: require("./assets/favicon.png") },
  { id: "11", name: "Bác Thắng", avatar: require("./assets/favicon.png") },
  { id: "12", name: "Bác Thành", avatar: require("./assets/favicon.png") },
  { id: "13", name: "Bác Tùng", avatar: require("./assets/favicon.png") },
  { id: "14", name: "Bác Tuyên", avatar: require("./assets/favicon.png") },
  { id: "15", name: "Bác Tú", avatar: require("./assets/favicon.png") },
];

const FriendItem = ({ friend }) => (
  <View style={{ flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: "#ddd" }}>
    <Image source={friend.avatar} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
    <Text style={{ flex: 1, fontSize: 16 }}>{friend.name}</Text>
    <TouchableOpacity>
      <Icon name="call" size={24} color="#2196F3" style={{ marginRight: 15 }} />
    </TouchableOpacity>
    <TouchableOpacity>
      <Icon name="videocam" size={24} color="#2196F3" />
    </TouchableOpacity>
  </View>
);

// Component con trong Danh bạ
const FriendsScreen = () => (
  <FlatList
    style={{ flex: 1, backgroundColor: "#fff" }}
    ListHeaderComponent={() => (
      <>
        <TouchableOpacity style={{ flexDirection: "row", padding: 10, alignItems: "center", borderBottomWidth: 1, borderColor: "#ddd" }}>
          <Icon name="person-add-outline" size={24} color="#2196F3" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 16 }}>Lời mời kết bạn (1)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: "row", padding: 10, alignItems: "center", borderBottomWidth: 1, borderColor: "#ddd" }}>
          <Icon name="book-outline" size={24} color="#2196F3" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 16 }}>Danh bạ máy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: "row", padding: 10, alignItems: "center", borderBottomWidth: 1, borderColor: "#ddd" }}>
          <Icon name="gift-outline" size={24} color="red" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 16, color: "red" }}>Sinh nhật - Hôm nay là sinh nhật Hải Nam</Text>
        </TouchableOpacity>
        <Text style={{ margin: 10, fontSize: 18, fontWeight: "bold" }}>Bạn thân</Text>
      </>
    )}
    data={friends}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <FriendItem friend={item} />}
  />
);

const groups = [
  { id: "1", name: "Nhóm React Native", members: 12, avatar: require("./assets/favicon.png") },
  { id: "2", name: "Nhóm Java Spring", members: 20, avatar: require("./assets/favicon.png") },
  { id: "3", name: "Nhóm Python AI", members: 15, avatar: require("./assets/favicon.png") },
  { id: "4", name: "Nhóm UI/UX", members: 8, avatar: require("./assets/favicon.png") },
];

const GroupItem = ({ group }) => (
  <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: "#ddd" }}>
    <Image source={group.avatar} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>{group.name}</Text>
      <Text style={{ fontSize: 14, color: "gray" }}>{group.members} thành viên</Text>
    </View>
    <Text style={{ fontSize: 14, color: "gray" }}>{group.members}</Text>
  </TouchableOpacity>
);

const GroupsScreen = () => (
  <FlatList
  ListHeaderComponent={() => (
    <>
      <TouchableOpacity style={{ flexDirection: "row", padding: 10, alignItems: "center", borderBottomWidth: 1, borderColor: "#ddd" }}>
        <Icon name="person-add-outline" size={50} color="#2196F3" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 16 }}>Tạo nhóm mới</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ flexDirection: "row", padding: 10, alignItems: "center", borderColor: "#ddd", justifyContent: "space-between" }}>
        <Text style={{ margin: 10, fontSize: 18, fontWeight: "bold" }}>Nhóm đang tham gia(4)</Text>
        <TouchableOpacity>
          <Icon name="funnel-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </TouchableOpacity>
    </>
  )}
    style={{ flex: 1, backgroundColor: "#fff" }}
    data={groups}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <GroupItem group={item} />}
  />
);

const qa = [
  { id: "1", name: "Zalo Pay", avatar: require("./assets/favicon.png") },
  { id: "2", name: "zStyle - Phong cách ZaloZalo", avatar: require("./assets/favicon.png") },
  { id: "3", name: "Báo tuổi trẻ", avatar: require("./assets/favicon.png") },
  { id: "4", name: "Điện lực", avatar: require("./assets/favicon.png") },
  { id: "5", name: "Thời tiết", avatar: require("./assets/favicon.png") },
  { id: "6", name: "Zing MP3", avatar: require("./assets/favicon.png") },
];

const QAItem = ({ qa }) => (
  <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: "#ddd" }}>
    <Image source={qa.avatar} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>{qa.name}</Text>
    </View>
  </TouchableOpacity>
);

const QAScreen = () => (
  <FlatList
  ListHeaderComponent={() => (
    <>
      <TouchableOpacity style={{ flexDirection: "row", padding: 10, alignItems: "center", borderBottomWidth: 1, borderColor: "#ddd" }}>
        <Icon name="radio-outline" size={50} color="#2196F3" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 16 }}>Tìm thêm Offical Account</Text>
      </TouchableOpacity>
    </>
  )}
    style={{ flex: 1, backgroundColor: "#fff" }}
    data={qa}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <QAItem qa={item} />}
  />
);

const ContactsTabs = () => (
  <TopTab.Navigator
    screenOptions={{
      tabBarActiveTintColor: "#2196F3",
      tabBarInactiveTintColor: "gray",
      tabBarIndicatorStyle: { backgroundColor: "#2196F3" },
    }}
  >
    <TopTab.Screen name="Bạn bè" component={FriendsScreen} />
    <TopTab.Screen name="Nhóm" component={GroupsScreen} />
    <TopTab.Screen name="QA" component={QAScreen} />
  </TopTab.Navigator>
);

const MessageTabs = () => (
  <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
    <Text style={{ margin: 20 }}>Tin nhắn</Text>
  </View>
);

const discovery = [
  { id: "1", name: "Game Center", avatar: require("./assets/favicon.png") },
  { id: "2", name: "Tiện ích đời sống", avatar: require("./assets/favicon.png") },
  { id: "3", name: "Tiện ích tài chính", avatar: require("./assets/favicon.png") },
  { id: "4", name: "Dịch vụ công", avatar: require("./assets/favicon.png") },
  { id: "5", name: "Mini App", avatar: require("./assets/favicon.png") },
];

const DiscoveryItem = ({ discovery }) => (
  <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: "#ddd" }}>
    <Image source={discovery.avatar} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>{discovery.name}</Text>
    </View>
    <Icon name="chevron-forward-outline" size={18} color="black" style={{ marginRight: 10 }} />
  </TouchableOpacity>
);

const DiscoveryTabs = () => (
  <FlatList
  ListHeaderComponent={() => (
    <>
      {/* <TouchableOpacity style={{ flexDirection: "row", padding: 10, alignItems: "center", borderBottomWidth: 1, borderColor: "#ddd" }}>
        <Icon name="radio-outline" size={50} color="#2196F3" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 16 }}>Tìm thêm Offical Account</Text>
      </TouchableOpacity> */}
    </>
  )}
    style={{ flex: 1, backgroundColor: "#fff" }}
    data={discovery}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <DiscoveryItem discovery={item} />}
  />
);

const stories = [
  { id: '1', name: 'Lộc lá', image: require('./assets/adaptive-icon.png') },
  { id: '2', name: 'Huỳnh Thư', image: require('./assets/icon.png') },
  { id: '3', name: 'Huỳnh Thư', image: require('./assets/icon.png') },
  { id: '4', name: 'Huỳnh Thư', image: require('./assets/icon.png') },
  { id: '5', name: 'Huỳnh Thư', image: require('./assets/icon.png') },
  { id: '6', name: 'Huỳnh Thư', image: require('./assets/icon.png') },
  { id: '7', name: 'Huỳnh Thư', image: require('./assets/icon.png') },
  { id: '8', name: 'Huỳnh Thư', image: require('./assets/icon.png') },
  { id: '9', name: 'Huỳnh Thư', image: require('./assets/icon.png') },
  { id: '10', name: 'Huỳnh Thư', image: require('./assets/icon.png') }
];

const posts = [
  {
      id: '1',
      avatar: require('./assets/favicon.png'),
      name: 'Huế Lê',
      time: '13/02 lúc 12:29',
      content: 'Đã thay đổi ảnh đại diện',
      image: require('./assets/splash-icon.png'),
  },
  {
      id: '2',
      avatar: require('./assets/favicon.png'),
      name: 'Huỳnh Thư',
      time: '13/02 lúc 12:29',
      content: 'Đã thay đổi ảnh đại diện',
      image: require('./assets/splash-icon.png'),
  },
  {
      id: '3',
      avatar: require('./assets/favicon.png'),
      name: 'Huỳnh Thư',
      time: '13/02 lúc 12:29',
      content: 'Đã thay đổi ảnh đại diện',
      image: require('./assets/splash-icon.png'),
  }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { padding: 10, alignItems: 'center' },
  searchText: { color: '#fff', fontSize: 18 },
  statusBox: { padding: 10, backgroundColor: '#fff', marginTop: 10 },
  statusText: { fontSize: 16, marginBottom: 10 , marginLeft: 10},
  statusButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  statusButton: { backgroundColor: '#e0e0e0', padding: 8, borderRadius: 5, width: '23%', alignItems: 'center' },
  buttonText: { fontSize: 14 },
  storyItem: { alignItems: 'center', margin: 5, borderWidth: 1, borderColor: '#ddd', padding: 5, borderRadius: 10 },
  storyImage: { width: 60, height: 60, borderRadius: 30 },
  storyName: { fontSize: 12, marginTop: 5 },
  postContainer: { backgroundColor: '#fff', padding: 10, marginTop: 10 },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  postName: { fontWeight: 'bold' },
  postTime: { color: 'gray', fontSize: 12 },
  postContent: { marginTop: 10, fontSize: 14 },
  postImage: { width: '100%', height: 200, marginTop: 10, borderRadius: 10 },
});


// const LogTabs = () => (
// <ScrollView style={styles.container}>

// {/* Phần Trạng Thái */}
// <View style={styles.statusBox}>
//     <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
//     <Image source={require('./assets/favicon.png')} style={{ width: 40, height: 40, borderRadius: 20 }} />
//     <Text style={styles.statusText}>Hôm nay bạn thế nào?</Text>
//     </View>
//     <View style={styles.statusButtons}>
//         {['Ảnh', 'Video', 'Album', 'Kỷ niệm'].map((item, index) => (
//             <TouchableOpacity key={index} style={styles.statusButton}>
//                 <Text style={styles.buttonText}>{item}</Text>
//             </TouchableOpacity>
//         ))}
//     </View>
// </View>

// {/* Phần Khoảnh Khắc (Story) */}

// <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10}}>
//   <TouchableOpacity style={styles.storyItem}>
//   <Icon name={"add"} size={60} color={"#2196F3"} />
//   <Text style={styles.storyName}>Tạo mới</Text>
//   </TouchableOpacity>


// <FlatList
//     horizontal
//     data={stories}
//     keyExtractor={(item) => item.id}
//     renderItem={({ item }) => (
//         <View style={styles.storyItem}>
//             <Image source={item.image} style={styles.storyImage} />
//             <Text style={styles.storyName}>{item.name}</Text>
//         </View>
//     )}
//     showsHorizontalScrollIndicator={false}
// />

// </View>

// {/* Danh sách bài đăng */}
// <FlatList
//     data={posts}
//     keyExtractor={(item) => item.id}
//     renderItem={({ item }) => (
//         <View style={styles.postContainer}>
//             <View style={styles.postHeader}>
//                 <Image source={item.avatar} style={styles.avatar} />
//                 <View>
//                     <Text style={styles.postName}>{item.name}</Text>
//                     <Text style={styles.postTime}>{item.time}</Text>
//                 </View>
//             </View>
//             <Text style={styles.postContent}>{item.content}</Text>
//             <Image source={item.image} style={styles.postImage} />
//         </View>
//     )}
// />
// </ScrollView>
// );

const LogTabs = () => (
  <FlatList
    style={styles.container}
    ListHeaderComponent={() => (
      <>
        {/* Phần Trạng Thái */}
        <View style={styles.statusBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image source={require('./assets/favicon.png')} style={{ width: 40, height: 40, borderRadius: 20 }} />
            <Text style={styles.statusText}>Hôm nay bạn thế nào?</Text>
          </View>
          <View style={styles.statusButtons}>
            {['Ảnh', 'Video', 'Album', 'Kỷ niệm'].map((item, index) => (
              <TouchableOpacity key={index} style={styles.statusButton}>
                <Text style={styles.buttonText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Phần Khoảnh Khắc (Story) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
          <TouchableOpacity style={styles.storyItem}>
            <Icon name={"add"} size={60} color={"#2196F3"} />
            <Text style={styles.storyName}>Tạo mới</Text>
          </TouchableOpacity>

          <FlatList
            horizontal
            data={stories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.storyItem}>
                <Image source={item.image} style={styles.storyImage} />
                <Text style={styles.storyName}>{item.name}</Text>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </>
    )}
    data={posts}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image source={item.avatar} style={styles.avatar} />
          <View>
            <Text style={styles.postName}>{item.name}</Text>
            <Text style={styles.postTime}>{item.time}</Text>
          </View>
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
        <Image source={item.image} style={styles.postImage} />
      </View>
    )}
  />
);


const personal = [
  { id: "1", name: "Game Center", avatar: require("./assets/favicon.png") },
  { id: "2", name: "Tiện ích đời sống", avatar: require("./assets/favicon.png") },
  { id: "3", name: "Tiện ích tài chính", avatar: require("./assets/favicon.png") },
  { id: "4", name: "Dịch vụ công", avatar: require("./assets/favicon.png") },
  { id: "5", name: "Mini App", avatar: require("./assets/favicon.png") },
];

const PersonalItem = ({ personal }) => (
  <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: "#ddd" }}>
    <Image source={personal.avatar} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>{personal.name}</Text>
    </View>
    <Icon name="chevron-forward-outline" size={18} color="black" style={{ marginRight: 10 }} />
  </TouchableOpacity>
);


const PersonalTabs = () => (
  <FlatList
  ListHeaderComponent={() => (
    <>
      <TouchableOpacity style={{ flexDirection: "row", padding: 10, alignItems: "center", borderBottomWidth: 1, borderColor: "#ddd", justifyContent: "space-between" }}>
        <View style={{flexDirection:"row", alignItems :"center"}}>
        <Image source={require('./assets/favicon.png')} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 10 }} />
        <Text style={{ fontSize: 16 }}>Lộc lá</Text>
        </View>
        <Icon name="swap-horizontal-outline" size={24} color="#2196F3" style={{ marginRight: 10 }} />
      </TouchableOpacity>
    </>
  )}
    style={{ flex: 1, backgroundColor: "#fff" }}
    data={personal}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <PersonalItem personal={item} />}
  />
);

const MainTabs = () => (
  <View style={{ flex: 1 }}>
    <SearchHeader />
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            "Tin nhắn": focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline",
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
      <Tab.Screen name="Tin nhắn" component={MessageTabs} />
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