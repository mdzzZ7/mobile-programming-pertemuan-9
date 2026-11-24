import { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AnimatedCard } from "../../src/AnimatedCard";
import { COLORS, MOOD_OPTIONS } from "../../src/constants";
import { addDiary } from "../../src/diarySlice";
import { useAppDispatch } from "../../src/hooks";

export default function CreateScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState("😊");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const today = new Date().toISOString().slice(0, 10);

  const handleSelectMood = (emoji: string) => {
    setMood(emoji);
    scaleAnim.setValue(0.82);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 130,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const save = async () => {
    if (!title.trim() || !body.trim()) {
      setErrorMsg("Judul dan isi catatan wajib diisi terlebih dahulu.");
      return;
    }
    setErrorMsg("");
    setSaving(true);
    try {
      await dispatch(
        addDiary({
          title: title.trim(),
          diary_date: today,
          body: body.trim(),
          mood,
        })
      ).unwrap();
      setTitle("");
      setBody("");
      setMood("😊");
      router.replace("/");
    } catch {
      setErrorMsg("Gagal menyimpan catatan ke server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.wrapper}>
      <AnimatedCard index={0}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.badgeText}>NEW ENTRY</Text>
            <Text style={styles.header}>Tulis Catatan</Text>
          </View>
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
            <Text style={styles.dateText}>{today}</Text>
          </View>
        </View>

        {errorMsg !== "" && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Mood Picker */}
        <Text style={styles.label}>Bagaimana perasaanmu hari ini?</Text>
        <View style={styles.moodGrid}>
          {MOOD_OPTIONS.map((item) => {
            const active = mood === item.emoji;
            return (
              <Pressable
                key={item.emoji}
                style={[styles.moodCard, active && styles.moodCardActive]}
                onPress={() => handleSelectMood(item.emoji)}
              >
                <Animated.Text
                  style={[
                    styles.moodEmoji,
                    active && { transform: [{ scale: scaleAnim }] },
                  ]}
                >
                  {item.emoji}
                </Animated.Text>
                <Text
                  style={[styles.moodLabel, active && styles.moodLabelActive]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Judul */}
        <Text style={styles.label}>Judul Catatan</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Contoh: Menyelesaikan API Express & Redux"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
        />

        {/* Isi */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Isi Catatan</Text>
          <Text style={styles.counterText}>{body.length} karakter</Text>
        </View>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Ceritakan progres atau pikiranmu hari ini..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          style={[styles.input, styles.bodyInput]}
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            saving && { opacity: 0.6 },
            pressed && { opacity: 0.9 },
          ]}
          onPress={save}
          disabled={saving}
        >
          <Ionicons name="checkmark-circle" size={20} color={COLORS.bg} />
          <Text style={styles.buttonText}>
            {saving ? "Menyimpan..." : "Simpan ke Database"}
          </Text>
        </Pressable>
      </AnimatedCard>
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  badgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  dateText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.danger,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 13,
    fontWeight: "600",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  counterText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  moodCard: {
    flexGrow: 1,
    minWidth: 96,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  moodCardActive: {
    backgroundColor: "rgba(56, 189, 248, 0.14)",
    borderColor: COLORS.primary,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  moodLabelActive: {
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 18,
    outlineStyle: "none" as any,
  },
  bodyInput: {
    minHeight: 160,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  button: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonText: {
    color: COLORS.bg,
    fontSize: 15,
    fontWeight: "800",
  },
});