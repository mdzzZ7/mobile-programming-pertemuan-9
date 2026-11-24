import { useEffect, useRef, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { AnimatedCard } from "../../src/AnimatedCard";
import { COLORS, MOOD_OPTIONS } from "../../src/constants";
import { editDiary, fetchDiaries } from "../../src/diarySlice";
import { useAppDispatch, useAppSelector } from "../../src/hooks";

export default function EditScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();

  const entries = useAppSelector((state) => state.diary.entries);
  const entry = entries.find((item) => item.id === Number(id));

  const [title, setTitle] = useState(entry?.title || "");
  const [body, setBody] = useState(entry?.body || "");
  const [mood, setMood] = useState(entry?.mood || "😊");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (entries.length === 0) {
      dispatch(fetchDiaries());
    }
  }, [entries.length, dispatch]);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setBody(entry.body);
      setMood(entry.mood || "😊");
    }
  }, [entry]);

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

  if (!entry) {
    return (
      <View style={styles.center}>
        <Text style={styles.mutedText}>Catatan tidak ditemukan.</Text>
      </View>
    );
  }

  const save = async () => {
    if (!title.trim() || !body.trim()) {
      setErrorMsg("Judul dan isi catatan tidak boleh kosong.");
      return;
    }
    setErrorMsg("");
    setSaving(true);
    try {
      await dispatch(
        editDiary({
          id: entry.id,
          data: {
            title: title.trim(),
            diary_date: entry.diary_date,
            body: body.trim(),
            mood,
          },
        })
      ).unwrap();
      router.replace({
        pathname: "/detail/[id]",
        params: { id: String(entry.id) },
      });
    } catch {
      setErrorMsg("Gagal memperbarui catatan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.wrapper}>
      <AnimatedCard index={0}>
        {errorMsg !== "" && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <Text style={styles.label}>Ubah Mood</Text>
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

        <Text style={styles.label}>Judul Catatan</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>Isi Catatan</Text>
          <Text style={styles.counterText}>{body.length} karakter</Text>
        </View>
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          style={[styles.input, styles.bodyInput]}
        />

        <Pressable
          style={[styles.button, saving && { opacity: 0.6 }]}
          onPress={save}
          disabled={saving}
        >
          <Ionicons name="save-outline" size={18} color={COLORS.bg} />
          <Text style={styles.buttonText}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
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