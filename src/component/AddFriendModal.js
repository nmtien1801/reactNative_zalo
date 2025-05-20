import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { getRoomChatByPhoneService } from '../service/roomChatService';
import InfoAddFriendMModal from './InfoAddFriendModal';

const AddFriendModal = ({ show, onHide, socketRef }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSearch = async () => {
    if (!searchQuery) return;

    const response = await getRoomChatByPhoneService(searchQuery);

    if (response.EC === 0) {
      setSearchResult(response.DT);
      openModal();
      setSearchQuery('');
    } else {
      setSearchQuery('');
      alert(response.EM);
    }
  };

  return (
    <Modal visible={show} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Thêm bạn</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="số tài khoản"
              keyboardType="phone-pad"
              value={searchQuery}
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) {
                  setSearchQuery(text);
                }
              }}
            />

            {searchQuery !== '' && (
              <IconButton
                icon="close"
                size={20}
                onPress={() => setSearchQuery('')}
              />
            )}
          </View>

          <View style={styles.buttonRow}>
            <Button mode="outlined" onPress={onHide} style={styles.button}>
              Hủy
            </Button>
            <Button mode="contained" onPress={handleSearch} style={styles.button}>
              Tìm kiếm
            </Button>
          </View>

          <InfoAddFriendMModal isOpen={isOpen} closeModal={closeModal} user={searchResult} socketRef={socketRef}/>
        </View>
      </View>
    </Modal>
  );
};

export default AddFriendModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000077',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    marginLeft: 10,
  },
});
