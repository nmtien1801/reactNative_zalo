import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Eye, EyeOff, RefreshCw } from "lucide-react-native";
import { Button } from "react-native-paper";
import { useDispatch, useSelector } from 'react-redux'
import { handleLogin } from "../../redux/authSlice";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
    captcha: "",
  });

  const handleChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    let res = await dispatch(handleLogin(formData));
    if(res.payload.EC === 0){
      navigation.navigate('MainTabs')
      await AsyncStorage.setItem('access_Token', res.payload.DT.access_Token);
      await AsyncStorage.setItem('refresh_Token', res.payload.DT.refresh_Token);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Zalo</Text>
        <Text style={styles.subtitle}>Đăng nhập với mật khẩu</Text>

        {/* Phone Number Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            value={formData.phoneNumber}
            onChangeText={(text) => handleChange("phoneNumber", text)}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconButton}>
            {showPassword ? <EyeOff size={20} color="#555" /> : <Eye size={20} color="#555" />}
          </TouchableOpacity>
        </View>

        {/* Captcha Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mã kiểm tra"
            value={formData.captcha}
            onChangeText={(text) => handleChange("captcha", text)}
          />
          <TouchableOpacity onPress={() => console.log("Refresh captcha")} style={styles.iconButton}>
            <RefreshCw size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <Button mode="contained" style={styles.button} onPress={handleSubmit}>
          Đăng nhập
        </Button>

        {/* Links */}
        <TouchableOpacity>
          <Text style={styles.linkText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.linkText}>Đăng nhập qua mã QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    padding: 24,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2962ff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    width: "100%",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  iconButton: {
    padding: 10,
  },
  button: {
    width: "100%",
    paddingVertical: 8,
    marginVertical: 10,
    backgroundColor: "#2962ff",
  },
  linkText: {
    color: "#2962ff",
    marginTop: 8,
    fontSize: 14,
  },
});
