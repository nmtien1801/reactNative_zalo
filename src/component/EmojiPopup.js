import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import { X, Search } from "lucide-react-native";

const EmojiPopup = ({ isOpen, position, onClose, onSelect }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [emojis, setEmojis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredEmojis, setFilteredEmojis] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "https://emoji-api.com/categories?access_key=7a007b3034c725cebcd6809ba76afc8351fa3c8f"
        );
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].slug);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách danh mục emoji:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEmojis = async () => {
      if (!activeCategory) return;
      setLoading(true);
      try {
        const response = await fetch(
          `https://emoji-api.com/categories/${activeCategory}?access_key=7a007b3034c725cebcd6809ba76afc8351fa3c8f`
        );
        const data = await response.json();
        setEmojis(data);
        setFilteredEmojis(data);
      } catch (error) {
        console.error(`Lỗi lấy emoji cho danh mục ${activeCategory}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmojis();
  }, [activeCategory]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmojis(emojis);
    } else {
      const filtered = emojis.filter((emoji) =>
        emoji.unicodeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmojis(filtered);
    }
  }, [searchTerm, emojis]);

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case "smileys-emotion":
        return "😀";
      case "people-body":
        return "👨";
      case "animals-nature":
        return "🐱";
      case "food-drink":
        return "🍔";
      case "travel-places":
        return "✈️";
      case "activities":
        return "⚽";
      case "objects":
        return "💡";
      case "symbols":
        return "❤️";
      case "flags":
        return "🏁";
      default:
        return "📋";
    }
  };

  const { width, height } = Dimensions.get("window");
  const popupWidth = 320;
  const popupHeight = 350;

  // Vị trí mặc định tránh tràn ra ngoài màn hình
  const top = height - popupHeight - 10; // 10px cách đáy
  const left = 10; // 10px từ mép trái

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.popup,
            {
              top,
              left,
              width: popupWidth,
              height: popupHeight,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <Search size={16} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm emoji..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Danh mục */}
          <ScrollView horizontal style={styles.categoryTabs}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.slug}
                style={[
                  styles.categoryTab,
                  activeCategory === cat.slug && styles.activeCategoryTab,
                ]}
                onPress={() => {
                  setActiveCategory(cat.slug);
                  setSearchTerm("");
                }}
              >
                <Text style={styles.categoryIcon}>
                  {getCategoryIcon(cat.slug)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Danh sách emoji */}
          <View style={styles.emojiContent}>
            {loading ? (
              <Text style={styles.loading}>Đang tải...</Text>
            ) : filteredEmojis.length === 0 ? (
              <Text style={styles.noResults}>Không tìm thấy emoji</Text>
            ) : (
              <FlatList
                data={filteredEmojis}
                keyExtractor={(item) => item.slug}
                numColumns={6}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.emojiButton}
                    onPress={() => onSelect(item.character)}
                  >
                    <Text style={styles.emojiText}>{item.character}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  popup: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  searchInput: {
    marginLeft: 6,
    paddingVertical: 4,
    flex: 1,
  },
  categoryTabs: {
    flexDirection: "row",
    marginVertical: 8,
    maxHeight: 55,
  },
  categoryTab: {
    padding: 6,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: "#eee",
  },
  activeCategoryTab: {
    backgroundColor: "#ddd",
  },
  categoryIcon: {
    fontSize: 18,
  },
  emojiContent: {
    flex: 1,
  },
  loading: {
    textAlign: "center",
    marginTop: 10,
  },
  noResults: {
    textAlign: "center",
    marginTop: 10,
  },
  emojiButton: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
    width: "16.66%",
  },
  emojiText: {
    fontSize: 22,
  },
});

export default EmojiPopup;
