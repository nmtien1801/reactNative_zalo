import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import { acceptGroupJoinRequestService, getGroupJoinRequestsService, rejectFriendRequestService } from "../../service/friendRequestService";


const GroupRequest = ({ route }) => {
    const [groupRequests, setGroupRequests] = useState([]);
    const userInfo = useSelector((state) => state.auth.userInfo);
    const socketRef = route.params.socketRef;

    const fetchGroupRequests = async () => {
        try {
            const response = await getGroupJoinRequestsService();
            console.log("Group requests response:", response);

            setGroupRequests(response.DT || []);

            // Socket listeners
            socketRef.current.on("RES_ADD_GROUP", async () => {
                const response = await getGroupJoinRequestsService();
                setGroupRequests(response.DT || []);
            });

            socketRef.current.on("RES_ACCEPT_FRIEND", async () => {
                const response = await getGroupJoinRequestsService();
                setGroupRequests(response.DT || []);
            });

            socketRef.current.on("RES_REJECT_FRIEND", async () => {
                const response = await getGroupJoinRequestsService();
                setGroupRequests(response.DT || []);
            });
        } catch (error) {
            console.error("Error fetching group requests:", error);
        }
    };

    useEffect(() => {
        fetchGroupRequests();
    }, []);

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await acceptGroupJoinRequestService(requestId);
            if (response.EC === 0) {
                socketRef.current.emit("REQ_ACCEPT_FRIEND", response.DT);
            }
            fetchGroupRequests();
        } catch (error) {
            console.error("Error accepting group request:", error);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const response = await rejectFriendRequestService(requestId);
            if (response.EC === 0) {
                socketRef.current.emit("REQ_REJECT_fRIEND", response.DT);
            }
            fetchGroupRequests();
        } catch (error) {
            console.error("Error rejecting group request:", error);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: item.fromUser.avatar }}
                style={styles.avatar}
            />
            <View style={styles.info}>
                <Text style={styles.name}>{item.fromUser.username}</Text>
                <Text style={styles.date}>{item.sent_at}</Text>
                <Text style={styles.message}>{item.content}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.rejectButton]}
                        onPress={() => handleRejectRequest(item._id)}
                    >
                        <Text style={styles.rejectText}>Từ chối</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.acceptButton]}
                        onPress={() => handleAcceptRequest(item._id)}
                    >
                        <Text style={styles.acceptText}>Đồng ý</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Lời mời vào nhóm ({groupRequests.length})
            </Text>
            <FlatList
                data={groupRequests}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#fff",
        flex: 1,
    },
    header: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    card: {
        flexDirection: "row",
        padding: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    info: {
        flex: 1,
        justifyContent: "center",
    },
    name: {
        fontWeight: "bold",
        fontSize: 16,
    },
    date: {
        color: "#888",
        fontSize: 12,
        marginBottom: 4,
    },
    message: {
        marginBottom: 8,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: "center",
    },
    rejectButton: {
        backgroundColor: "#eee",
    },
    acceptButton: {
        backgroundColor: "#007bff",
    },
    rejectText: {
        color: "#333",
    },
    acceptText: {
        color: "#fff",
    },
});

export default GroupRequest;