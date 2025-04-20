import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";

const ManageGroup = ({ navigation, route }) => {
  let item = route.params?.receiver; // click conversation
  let socketRef = route.params?.socketRef;
  let onlineUsers = route.params?.onlineUsers;
  const conversations = route.params?.conversations;

  const permissions = [
    "Thay đổi tên & ảnh đại diện của nhóm",
    "Ghim tin nhắn, ghi chú, bình chọn lên đầu hội thoại",
    "Tạo mới ghi chú, nhắc hẹn",
    "Tạo mới bình chọn",
    "Gửi tin nhắn",
  ];

  const settings = [
    "Chế độ phê duyệt thành viên mới",
    "Đánh dấu tin nhắn từ trưởng/phó nhóm",
    "Cho phép thành viên mới đọc tin nhắn gần nhất",
    "Cho phép dùng link tham gia nhóm",
  ];

  const [checkedStates, setCheckedStates] = useState(
    Array(permissions.length).fill(true)
  );

  const handleCheckboxChange = (index) => {
    const updated = [...checkedStates];
    updated[index] = !updated[index];
    setCheckedStates(updated);
  };

  // chọn settings
  const [settingSwitches, setSettingSwitches] = useState(
    Array(settings.length).fill(false)
  );
  const toggleSettingSwitch = (idx) => {
    const updated = [...settingSwitches];
    updated[idx] = !updated[idx];
    setSettingSwitches(updated);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      {/* Header */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("PersonOption", {
              receiver: item,
              socketRef,
              onlineUsers,
              conversations,
            })
          }
        >
          <Feather
            name="arrow-left"
            size={20}
            color="black"
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Quản lý nhóm
        </Text>
      </View>

      {/* Quyền thành viên */}
      <Text style={{ fontWeight: "600", marginBottom: 8 }}>
        Cho phép các thành viên trong nhóm:
      </Text>
      {permissions.map((text, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => handleCheckboxChange(idx)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Feather
            name={checkedStates[idx] ? "check-square" : "square"}
            size={20}
            color={checkedStates[idx] ? "#007bff" : "#999"} // xanh dương khi được chọn
            style={{ marginRight: 10 }}
          />
          <Text>{text}</Text>
        </TouchableOpacity>
      ))}

      {/* Cài đặt nhóm */}
      <Text style={{ fontWeight: "600", marginTop: 20, marginBottom: 8 }}>
        Cài đặt nhóm
      </Text>
      {settings.map((label, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ flex: 1 }}>{label}</Text>
          <Switch
            value={settingSwitches[idx]}
            onValueChange={() => toggleSettingSwitch(idx)}
            trackColor={{ false: "#ccc", true: "#007bff" }} // Màu viền khi bật/tắt
            thumbColor={settingSwitches[idx] ? "#007bff" : "#f4f3f4"} // Màu nút tròn
          />
        </View>
      ))}

      {/* Link tham gia */}
      <View
        style={{ marginTop: 16, flexDirection: "row", alignItems: "center" }}
      >
        <TextInput
          value="zalo.me/g/fmrwto598"
          editable={false}
          style={{
            flex: 1,
            borderColor: "#ccc",
            borderWidth: 1,
            borderRadius: 6,
            paddingHorizontal: 10,
            height: 40,
            marginRight: 6,
          }}
        />
        <TouchableOpacity onPress={() => Alert.alert("Copy")}>
          <Text style={{ fontSize: 18 }}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert("Chia sẻ")}>
          <Text style={{ fontSize: 18, marginLeft: 6 }}>🔗</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert("Cập nhật")}>
          <Text style={{ fontSize: 18, marginLeft: 6 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Hành động */}
      <Text style={{ fontWeight: "600", marginTop: 20, marginBottom: 8 }}>
        Hành động
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: "#f8d7da",
          borderColor: "#f5c2c7",
          borderWidth: 1,
          borderRadius: 6,
          padding: 12,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name="user-x" size={18} color="#dc3545" />
        <Text style={{ color: "#dc3545", marginLeft: 8 }}>Chặn khỏi nhóm</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "#e2e3e5",
          borderColor: "#d3d6d8",
          borderWidth: 1,
          borderRadius: 6,
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name="users" size={18} />
        <Text style={{ marginLeft: 8 }}>Trưởng & phó nhóm</Text>
      </TouchableOpacity>

      {/* Nút giải tán nhóm */}
      <TouchableOpacity
        style={{
          backgroundColor: "#dc3545",
          marginTop: 20,
          padding: 12,
          borderRadius: 6,
          alignItems: "center",
        }}
      >
        <Feather name="trash" size={16} color="#fff" />
        <Text style={{ color: "#fff", marginTop: 4 }}>Giải tán nhóm</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ManageGroup;
