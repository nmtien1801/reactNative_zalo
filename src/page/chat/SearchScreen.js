import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { getConversations } from '../../redux/chatSlice';

const { height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.08;
const AVATAR_SIZE = height * 0.06;

const SearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { socketRef, onlineUsers } = route.params || {};
  const user = useSelector((state) => state.auth.user);
  const conversationRedux = useSelector((state) => state.chat.conversations);

  const [searchText, setSearchText] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);

  useEffect(() => {
    if (user?._id) {
      dispatch(getConversations(user._id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    const lowerText = searchText.toLowerCase();
    const filtered = conversationRedux
      .map((item) => ({
        _id: item.receiver?._id || '', // Kiểm tra an toàn
        username: item.receiver?.username || 'Unknown', // Kiểm tra an toàn
        avatar: item.avatar || null,
      }))
      .filter((item) => item.username.toLowerCase().includes(lowerText));
    setFilteredConversations(filtered);
  }, [searchText, conversationRedux]);

  const handleSelectUser = (item) => {
    navigation.navigate('InboxScreen', {
      item,
      socketRef,
      onlineUsers,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      {/* Thanh tìm kiếm */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#007bff',
          height: HEADER_HEIGHT,
          paddingHorizontal: 10,
          paddingTop: 5,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 20,
            paddingHorizontal: 12,
            height: 40,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <Icon name="search" size={22} color="#888" />
          <TextInput
            placeholder="Tìm kiếm tên người dùng..."
            style={{ flex: 1, fontSize: 15, marginLeft: 8 }}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
            autoFocus
          />
        </View>
      </View>

      {/* Danh sách kết quả */}
      {searchText !== '' && (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 15,
                paddingVertical: 10,
                backgroundColor: '#fff',
                marginBottom: 5,
              }}
              onPress={() => handleSelectUser(item)}
            >
              <Image
                source={item.avatar}
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_SIZE / 2,
                  marginRight: 15,
                  backgroundColor: '#eee',
                }}
              />
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#333' }}>
                {item.username}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ color: 'gray' }}>Không tìm thấy kết quả</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;
