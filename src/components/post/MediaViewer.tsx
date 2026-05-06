import { Modal, View, Image, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  uris: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function MediaViewer({ visible, uris, initialIndex = 0, onClose }: Props) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay} testID="media-viewer">
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} testID="close-button">
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <FlatList
          data={uris}
          keyExtractor={(item, i) => `${item}-${i}`}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          renderItem={({ item }) => (
            <View style={styles.page}>
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="contain"
                testID={`media-image-${item}`}
              />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
        {uris.length > 1 && (
          <Text style={styles.counter}>
            {initialIndex + 1} / {uris.length}
          </Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center" },
  closeBtn: { position: "absolute", top: 48, right: 16, zIndex: 10, padding: 8 },
  closeText: { color: "#FFF", fontSize: 24 },
  page: { width, height, justifyContent: "center", alignItems: "center" },
  image: { width, height: height * 0.8 },
  counter: { position: "absolute", bottom: 40, alignSelf: "center", color: "#FFF", fontSize: 14 },
});
