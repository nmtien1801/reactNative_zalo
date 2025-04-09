import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../redux/authSlice";
import { useNavigation } from "@react-navigation/native";

const ChangePassword = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const navigation = useNavigation();
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.currentPassword) {
      tempErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }
    if (!formData.newPassword) {
      tempErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 4) {
      tempErrors.newPassword = "Mật khẩu mới phải có ít nhất 4 ký tự";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("user: ", user);
    
    let tempErrors = {};
    if (validateForm()) {
      const res = await dispatch(
        changePassword({
          phone: user.phone,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        })
      );

      if (res.payload?.EC !== 0) {
        tempErrors.currentPassword = res.payload.EM;
        setErrors(tempErrors);
      } else {
        Alert.alert("Thành công", "Mật khẩu đã được thay đổi");
        navigation.goBack()
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đổi mật khẩu</Text>

      <TextInput
        placeholder="Mật khẩu hiện tại"
        secureTextEntry
        style={[styles.input, errors.currentPassword && styles.inputError]}
        value={formData.currentPassword}
        onChangeText={(text) => handleChange("currentPassword", text)}
      />
      {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}

      <TextInput
        placeholder="Mật khẩu mới"
        secureTextEntry
        style={[styles.input, errors.newPassword && styles.inputError]}
        value={formData.newPassword}
        onChangeText={(text) => handleChange("newPassword", text)}
      />
      {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

      <TextInput
        placeholder="Xác nhận mật khẩu mới"
        secureTextEntry
        style={[styles.input, errors.confirmPassword && styles.inputError]}
        value={formData.confirmPassword}
        onChangeText={(text) => handleChange("confirmPassword", text)}
      />
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#aaa",
  },
  submitButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
