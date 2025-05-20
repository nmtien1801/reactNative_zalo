import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Video } from "expo-av"; // Import Video từ expo-av
import Icon from "react-native-vector-icons/Feather"; // Import Feather icons

const MediaFilesLinksScreen = ({ route, navigation }) => {
  const mediaMessages = route.params?.mediaMessages;
  const fileMessages = route.params?.fileMessages;
  const linkMessages = route.params?.linkMessages;

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "media", title: "Ảnh/Video" },
    { key: "files", title: "File" },
    { key: "links", title: "Link" },
  ]);

const renderMedia = () => (
  <ScrollView contentContainerStyle={styles.gridContainer}>
    {mediaMessages.map((msg, index) => (
      <TouchableOpacity
        key={index}
        style={styles.mediaItem}
        activeOpacity={0.8}
        onPress={() => {
          // Điều hướng đến màn hình xem chi tiết ảnh/video
          navigation.navigate("MediaViewer", { media: msg });
        }}
      >
        {msg.type === "image" ? (
          <Image
            source={{ uri: msg.msg }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        ) : (
          <Video
            source={{ uri: msg.msg }}
            style={styles.mediaImage}
            resizeMode="cover"
            useNativeControls
          />
        )}
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// const renderMedia = () => (
//   <ScrollView contentContainerStyle={styles.gridContainer}>
//     {mediaMessages.map((msg, index) => (
//       <TouchableOpacity
//         key={index}
//         style={styles.mediaItem}
//         activeOpacity={0.8}
//         onPress={() => {
//           console.log("Clicked media:", msg.msg);
//         }}
//       >
//         {msg.type === "image" ? (
//           <Image
//             source={{ uri: msg.msg }}
//             style={styles.mediaImage}
//             resizeMode="cover"
//           />
//         ) : (
//           <video
//             src={msg.msg}
//             style={styles.mediaImage}
//             controls
//           />
//         )}
//       </TouchableOpacity>
//     ))}
//   </ScrollView>
// );

const renderFiles = () => (
  <ScrollView contentContainerStyle={styles.listContainer}>
    {fileMessages.map((msg, index) => (
      <TouchableOpacity
        key={index}
        style={styles.fileItem}
        onPress={() => {
          // Mở file trong trình duyệt
          Linking.openURL(msg.msg);
        }}
      >
        <Icon name="file" size={20} color="#007bff" style={styles.fileIcon} />
        <Text style={styles.fileText}>
          {msg.msg.split("/").pop() || `File ${index + 1}`}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// const renderFiles = () => (
//   <ScrollView contentContainerStyle={styles.listContainer}>
//     {fileMessages.map((msg, index) => (
//       <TouchableOpacity key={index} style={styles.fileItem}>
//         <Icon name="file" size={20} color="#007bff" style={styles.fileIcon} />
//         <a
//           href={msg.msg}
//           target="_blank"
//           rel="noopener noreferrer"
//           style={{ textDecoration: "none", color: "#333" }}
//         >
//           <Text style={styles.fileText}>
//             {msg.msg.split("/").pop() || `File ${index + 1}`}
//           </Text>
//         </a>
//       </TouchableOpacity>
//     ))}
//   </ScrollView>
// );

const renderLinks = () => (
  <ScrollView contentContainerStyle={styles.listContainer}>
    {linkMessages.map((msg, index) => (
      <TouchableOpacity
        key={index}
        style={styles.linkItem}
        onPress={() => {
          // Mở link trong trình duyệt
          Linking.openURL(msg.msg);
        }}
      >
        <Icon name="link" size={20} color="#007bff" style={styles.linkIcon} />
        <Text style={styles.linkText}>{msg.msg}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// const renderLinks = () => (
//   <ScrollView contentContainerStyle={styles.listContainer}>
//     {linkMessages.map((msg, index) => (
//       <TouchableOpacity key={index} style={styles.linkItem}>
//         <Icon name="link" size={20} color="#007bff" style={styles.linkIcon} />
//         <a
//           href={msg.msg}
//           target="_blank"
//           rel="noopener noreferrer"
//           style={{ textDecoration: "none", color: "#007bff" }}
//         >
//           <Text style={styles.linkText}>{msg.msg}</Text>
//         </a>
//       </TouchableOpacity>
//     ))}
//   </ScrollView>
// );

  const renderScene = SceneMap({
    media: renderMedia,
    files: renderFiles,
    links: renderLinks,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={styles.tabIndicator} // Thanh chỉ báo bên dưới tab
          style={styles.tabBar} // Kiểu của thanh tab
          labelStyle={styles.tabLabel} // Kiểu của tên tab
          activeColor="#007bff" // Màu của tab đang được chọn
          inactiveColor="#555" // Màu của tab không được chọn
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Căn đều khoảng cách giữa các ảnh
    padding: 10,
  },
  mediaItem: {
    width: "30%", // Mỗi ảnh chiếm 30% chiều rộng
    aspectRatio: 1, // Đảm bảo ảnh vuông
    marginBottom: 10, // Khoảng cách giữa các hàng
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0", // Màu nền khi ảnh chưa tải
  },
  mediaImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  tabBar: {
    backgroundColor: "#fff",
  },
  tabIndicator: {
    backgroundColor: "#007bff",
  },
  tabLabel: {
    color: "#333",
    fontWeight: "bold",
  },
  listContainer: {
    padding: 10,
  },
  fileItem: {
    flexDirection: "row", // Hiển thị icon và text trên cùng một hàng
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  fileIcon: {
    marginRight: 10, // Khoảng cách giữa icon và text
  },
  fileText: {
    fontSize: 16,
    color: "#333",
  },
  linkItem: {
    flexDirection: "row", // Hiển thị icon và text trên cùng một hàng
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  linkIcon: {
    marginRight: 10, // Khoảng cách giữa icon và text
  },
  linkText: {
    fontSize: 16,
    color: "#007bff",
  },
});

export default MediaFilesLinksScreen;