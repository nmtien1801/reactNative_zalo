import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Modal,
    ActivityIndicator,
    ScrollView,
    Alert,
    SafeAreaView
} from "react-native";
import { getAllFriendsService } from "../../service/friendShipService";
import { addMembersToRoomChatService, getRoomChatByPhoneService, getRoomChatMembersService } from "../../service/roomChatService";


const AddMemberModal = ({ show, onHide, roomId, user, socketRef }) => {
    const [friends, setFriends] = useState([]); // Friends list
    const [members, setMembers] = useState([]); // Room members list
    const [selectedFriends, setSelectedFriends] = useState([]); // Selected friends
    const [searchTerm, setSearchTerm] = useState(""); // Search keyword
    const [searchResults, setSearchResults] = useState([]); // Search results by phone
    const [isSubmitting, setIsSubmitting] = useState(false); // Submission state
    const [loading, setLoading] = useState(false);

    // Fetch friends and members when modal opens
    useEffect(() => {
        const fetchFriendsAndMembers = async () => {
            setLoading(true);
            try {
                const friendsResponse = await getAllFriendsService();
                setFriends(friendsResponse.DT || []);

                const membersResponse = await getRoomChatMembersService(roomId);
                setMembers(membersResponse.DT || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (show) {
            fetchFriendsAndMembers();
        }
    }, [show, roomId]);

    // Handle search by name or phone
    useEffect(() => {
        const search = async () => {
            if (searchTerm.length === 10 && /^\d+$/.test(searchTerm)) {
                try {
                    const response = await getRoomChatByPhoneService(searchTerm);
                    const searchResult = response.DT ? [response.DT] : [];
                    setSearchResults(searchResult);
                } catch (error) {
                    console.error("Error searching by phone:", error);
                    setSearchResults([]);
                }
            } else if (searchTerm.trim() === "") {
                setSearchResults([]);
            } else if (/^\d+$/.test(searchTerm)) {
                setSearchResults([]);
            } else {
                const filteredFriends = friends.filter((friend) =>
                    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setSearchResults(filteredFriends);
            }
        };

        search();
    }, [searchTerm, friends]);

    // Check if friend is already a member
    const isMember = (friendId) => members.some((member) => member._id === friendId);

    // Handle selecting a friend
    const handleSelectFriend = (friend) => {
        if (selectedFriends.some((selected) => selected._id === friend._id)) {
            setSelectedFriends(selectedFriends.filter((selected) => selected._id !== friend._id));
        } else {
            setSelectedFriends([...selectedFriends, friend]);
        }
    };

    // Display list
    const displayList =
        searchResults.length > 0
            ? searchResults
            : [
                ...selectedFriends,
                ...friends.filter((friend) => !selectedFriends.some((selected) => selected._id === friend._id)),
            ];

    // Close modal and reset states
    const handleClose = () => {
        setFriends([]);
        setMembers([]);
        setSelectedFriends([]);
        setSearchTerm("");
        setSearchResults([]);
        onHide();
    };

    // Add members to room
    const handleAddMembers = async () => {
        if (selectedFriends.length === 0) {
            Alert.alert("Thông báo", "Vui lòng chọn ít nhất một thành viên để thêm vào nhóm.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await addMembersToRoomChatService(roomId, selectedFriends);

            if (response.EC === 0) {
                Alert.alert("Thành công", "Thêm thành viên thành công!");
                handleClose();
            } else {
                Alert.alert("Lỗi", response.EM || "Có lỗi xảy ra khi thêm thành viên.");
            }
        } catch (error) {
            console.error("Error adding members:", error);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi thêm thành viên.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render friend item
    const renderFriendItem = ({ item }) => (
        <View style={styles.memberItem}>
            <Image
                source={{ uri: item.avatar || "https://via.placeholder.com/40" }}
                style={styles.avatar}
            />
            <View style={styles.memberInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
            </View>
            {isMember(item._id) ? (
                <Text style={styles.joinedStatus}>Đã tham gia</Text>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.checkbox,
                        selectedFriends.some((selected) => selected._id === item._id) && styles.checkboxSelected,
                    ]}
                    onPress={() => handleSelectFriend(item)}
                >
                    {selectedFriends.some((selected) => selected._id === item._id) && (
                        <Text style={styles.checkmark}>✓</Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );

    // Render selected friend item
    const renderSelectedFriendItem = ({ item }) => (
        <View style={styles.selectedItem}>
            <Image
                source={{ uri: item.avatar || "https://via.placeholder.com/40" }}
                style={styles.selectedAvatar}
            />
            <View style={styles.selectedInfo}>
                <Text style={styles.selectedUsername}>{item.username}</Text>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleSelectFriend(item)}
            >
                <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={show}  // Thay 'show' bằng 'visible'
            onRequestClose={handleClose}  // Thay 'onHide' bằng 'onRequestClose'
            animationType="slide"
            transparent={true}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Thêm thành viên</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search input */}
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Nhập tên hoặc số điện thoại"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />

                    {/* Loading indicator */}
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
                    ) : (
                        <View style={styles.listContainer}>
                            {/* Friends list */}
                            <View style={styles.friendsListContainer}>
                                {searchTerm.length > 0 && /^\d+$/.test(searchTerm) && searchTerm.length < 10 ? (
                                    <Text style={styles.noResults}>Không tìm thấy kết quả</Text>
                                ) : displayList.length > 0 ? (
                                    <FlatList
                                        data={displayList}
                                        renderItem={renderFriendItem}
                                        keyExtractor={(item) => item._id}
                                        showsVerticalScrollIndicator={false}
                                    />
                                ) : (
                                    <Text style={styles.noResults}>Không tìm thấy kết quả</Text>
                                )}
                            </View>

                            {/* Selected friends list */}
                            {selectedFriends.length > 0 && (
                                <View style={styles.selectedListContainer}>
                                    <Text style={styles.selectedHeader}>
                                        Đã chọn ({selectedFriends.length})
                                    </Text>
                                    <FlatList
                                        data={selectedFriends}
                                        renderItem={renderSelectedFriendItem}
                                        keyExtractor={(item) => item._id}
                                        showsVerticalScrollIndicator={false}
                                    />
                                </View>
                            )}
                        </View>
                    )}

                    {/* Footer buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, isSubmitting && styles.disabledButton]}
                            onPress={handleAddMembers}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.buttonText}>
                                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center"
    },
    modalContent: {
        backgroundColor: "white",
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
        maxHeight: "90%"
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15
    },
    title: {
        fontSize: 18,
        fontWeight: "bold"
    },
    closeButton: {
        padding: 5
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: "bold"
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15
    },
    listContainer: {
        flexDirection: "row",
        flex: 1
    },
    friendsListContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        maxHeight: 400
    },
    selectedListContainer: {
        marginLeft: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        width: 150,
        maxHeight: 400
    },
    selectedHeader: {
        fontWeight: "bold",
        marginBottom: 10
    },
    memberItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee"
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10
    },
    memberInfo: {
        flex: 1
    },
    username: {
        fontWeight: "bold"
    },
    phone: {
        fontSize: 12,
        color: "#888"
    },
    joinedStatus: {
        color: "#888",
        fontSize: 12
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: "#007bff",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center"
    },
    checkboxSelected: {
        backgroundColor: "#007bff"
    },
    checkmark: {
        color: "white",
        fontWeight: "bold"
    },
    selectedItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#eee"
    },
    selectedAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 5
    },
    selectedInfo: {
        flex: 1
    },
    selectedUsername: {
        fontWeight: "bold",
        fontSize: 12
    },
    removeButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#007bff",
        justifyContent: "center",
        alignItems: "center"
    },
    removeButtonText: {
        color: "#007bff",
        fontSize: 12
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#eee"
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 10
    },
    cancelButton: {
        backgroundColor: "#6c757d"
    },
    confirmButton: {
        backgroundColor: "#007bff"
    },
    disabledButton: {
        opacity: 0.7
    },
    buttonText: {
        color: "white",
        fontWeight: "bold"
    },
    loading: {
        marginVertical: 20
    },
    noResults: {
        textAlign: "center",
        color: "#888",
        marginTop: 20
    }
});

export default AddMemberModal;