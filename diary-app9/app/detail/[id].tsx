import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AnimatedCard } from "../../src/AnimatedCard";
import { COLORS } from "../../src/constants";
import { fetchDiaries, removeDiary } from "../../src/diarySlice";
import { useAppDispatch, useAppSelector } from "../../src/hooks";

export default function DetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const modalScale = useRef(new Animated.Value(0.88)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const entries = useAppSelector((state) => state.diary.entries);
  const entry = entries.find((item) => item.id === Number(id));

  useEffect(() => {
    if (entries.length === 0) {
      dispatch(fetchDiaries());
    }
  }, [entries.length, dispatch]);

  useEffect(() => {
    if (confirmVisible) {
      modalScale.setValue(0.88);
      modalOpacity.setValue(0);
      const useNative = Platform.OS !== "web";
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: useNative,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 6,
          tension: 110,
          useNativeDriver: useNative,
        }),
      ]).start();
    }
  }, [confirmVisible, modalOpacity, modalScale]);

  if (!entry) {
    return (
      <View style={styles.center}>
        <Text style={styles.mutedText}>Catatan tidak ditemukan.</Text>
      </View>
    );
  }

  const wordCount = entry.body.trim().split(/\s+/).filter(Boolean).length;

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(removeDiary(entry.id)).unwrap();
      setConfirmVisible(false);
      router.replace("/");
    } catch {
      setDeleting(false);
      setConfirmVisible(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.wrapper}>
      <AnimatedCard index={0}>
        <View style={styles.articleCard}>
          {/* Header Meta */}
          <View style={styles.metaRow}>
            <View style={styles.moodCircle}>
              <Text style={styles.mood}>{entry.mood || "📝"}</Text>
            </View>
            <View style={styles.metaBadges}>
              <View style={styles.pill}>
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={COLORS.primary}
                />
                <Text style={styles.pillText}>{entry.diary_date}</Text>
              </View>
              <View style={styles.pill}>
                <Ionicons
                  name="reader-outline"
                  size={13}
                  color={COLORS.accent}
                />
                <Text style={[styles.pillText, { color: COLORS.accent }]}>
                  {wordCount} kata
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.title}>{entry.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.body}>{entry.body}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable
            style={styles.editBtn}
            onPress={() =>
              router.push({
                pathname: "/edit/[id]",
                params: { id: String(entry.id) },
              })
            }
          >
            <Ionicons name="create-outline" size={18} color={COLORS.bg} />
            <Text style={styles.editBtnText}>Edit Catatan</Text>
          </Pressable>

          <Pressable
            style={styles.deleteBtn}
            onPress={() => setConfirmVisible(true)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            <Text style={styles.deleteBtnText}>Hapus</Text>
          </Pressable>
        </View>
      </AnimatedCard>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="none"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalBox,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <View style={styles.modalIcon}>
              <Ionicons name="warning-outline" size={28} color={COLORS.danger} />
            </View>
            <Text style={styles.modalTitle}>Hapus Catatan Ini?</Text>
            <Text style={styles.modalDesc}>
              Catatan "{entry.title}" akan dihapus permanen dari database MySQL.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </Pressable>
              <Pressable
                style={styles.confirmDeleteBtn}
                onPress={confirmDelete}
                disabled={deleting}
              >
                <Text style={styles.confirmDeleteText}>
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  wrapper: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  mutedText: {
    color: COLORS.textMuted,
    fontSize: 15,
  },
  articleCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 24,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  moodCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  mood: {
    fontSize: 32,
  },
  metaBadges: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pillText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 34,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },
  body: {
    fontSize: 16,
    color: "#CBD5E1",
    lineHeight: 26,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  editBtn: {
    flex: 2,
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: {
    color: COLORS.bg,
    fontSize: 15,
    fontWeight: "800",
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.danger,
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalDesc: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.text,
    fontWeight: "700",
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: COLORS.danger,
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmDeleteText: {
    color: "#fff",
    fontWeight: "700",
  },
});