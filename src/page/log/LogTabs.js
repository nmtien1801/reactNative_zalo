import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import SearchHeader from "../../component/Header";

export default function LogTabs() {
  const stories = [
    {
      id: "1",
      name: "Lộc lá",
      image: require("../../../assets/adaptive-icon.png"),
    },
    { id: "2", name: "Huỳnh Thư", image: require("../../../assets/icon.png") },
    { id: "3", name: "Huỳnh Thư", image: require("../../../assets/icon.png") },
    { id: "4", name: "Huỳnh Thư", image: require("../../../assets/icon.png") },
    { id: "5", name: "Huỳnh Thư", image: require("../../../assets/icon.png") },
    { id: "6", name: "Huỳnh Thư", image: require("../../../assets/icon.png") },
    { id: "7", name: "Huỳnh Thư", image: require("../../../assets/icon.png") },
    { id: "8", name: "Huỳnh Thư", image: require("../../../assets/icon.png") },
    { id: "9", name: "Huỳnh Thư", image: require("../../../assets/icon.png") },
    { id: "10", name: "Huỳnh Thư", image: require("../../../assets/icon.png") },
  ];

  const posts = [
    {
      id: "1",
      avatar: require("../../../assets/favicon.png"),
      name: "Huế Lê",
      time: "13/02 lúc 12:29",
      content: "Đã thay đổi ảnh đại diện",
      image: require("../../../assets/splash-icon.png"),
    },
    {
      id: "2",
      avatar: require("../../../assets/favicon.png"),
      name: "Huỳnh Thư",
      time: "13/02 lúc 12:29",
      content: "Đã thay đổi ảnh đại diện",
      image: require("../../../assets/splash-icon.png"),
    },
    {
      id: "3",
      avatar: require("../../../assets/favicon.png"),
      name: "Huỳnh Thư",
      time: "13/02 lúc 12:29",
      content: "Đã thay đổi ảnh đại diện",
      image: require("../../../assets/splash-icon.png"),
    },
  ];

  // const LogTabs = () => (
  // <ScrollView style={styles.container}>

  // {/* Phần Trạng Thái */}
  // <View style={styles.statusBox}>
  //     <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
  //     <Image source={require('../../../assets/favicon.png')} style={{ width: 40, height: 40, borderRadius: 20 }} />
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

  return (
    <View>
      <SearchHeader option={'logTab'}/>

      <FlatList
        style={styles.container}
        ListHeaderComponent={() => (
          <>
            {/* Phần Trạng Thái */}
            <View style={styles.statusBox}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Image
                  source={require("../../../assets/favicon.png")}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
                <Text style={styles.statusText}>Hôm nay bạn thế nào?</Text>
              </View>
              <View style={styles.statusButtons}>
                {["Ảnh", "Video", "Album", "Kỷ niệm"].map((item, index) => (
                  <TouchableOpacity key={index} style={styles.statusButton}>
                    <Text style={styles.buttonText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Phần Khoảnh Khắc (Story) */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 10,
              }}
            >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchBar: { padding: 10, alignItems: "center" },
  searchText: { color: "#fff", fontSize: 18 },
  statusBox: { padding: 10, backgroundColor: "#fff", marginTop: 10 },
  statusText: { fontSize: 16, marginBottom: 10, marginLeft: 10 },
  statusButtons: { flexDirection: "row", justifyContent: "space-between" },
  statusButton: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 5,
    width: "23%",
    alignItems: "center",
  },
  buttonText: { fontSize: 14 },
  storyItem: {
    alignItems: "center",
    margin: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 5,
    borderRadius: 10,
  },
  storyImage: { width: 60, height: 60, borderRadius: 30 },
  storyName: { fontSize: 12, marginTop: 5 },
  postContainer: { backgroundColor: "#fff", padding: 10, marginTop: 10 },
  postHeader: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  postName: { fontWeight: "bold" },
  postTime: { color: "gray", fontSize: 12 },
  postContent: { marginTop: 10, fontSize: 14 },
  postImage: { width: "100%", height: 200, marginTop: 10, borderRadius: 10 },
});
