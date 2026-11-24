import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
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
import { fetchDiaries } from "../../src/diarySlice";
import { useAppDispatch, useAppSelector } from "../../src/hooks";

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { entries, loading, error } = useAppSelector((state) => state.diary);

  const [search, setSearch] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("ALL");

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    dispatch(fetchDiaries());
  }, [dispatch]);

  useEffect(() => {
    const useNative = Platform.OS !== "web";
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: useNative,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: useNative,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.body.toLowerCase().includes(search.toLowerCase());
      const matchMood =
        selectedMood === "ALL" || item.mood === selectedMood;
      return matchSearch && matchMood;
    });
  }, [entries, search, selectedMood]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.mutedText}>Memuat catatan dari MySQL...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={44} color={COLORS.danger} />
        <Text style={[styles.title, { marginTop: 10 }]}>{error}</Text>
        <Pressable
          style={styles.retryBtn}
          onPress={() => dispatch(fetchDiaries())}
        >
          <Text style={styles.retryText}>Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.badgeText}>DAILY JOURNAL</Text>
            <Text style={styles.header}>Buku Harian</Text>
          </View>
          <View style={styles.statusPill}>
            <Animated.View style={[styles.onlineDot, { opacity: pulseAnim }]} />
            <Text style={styles.statusText}>MySQL Sync</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{entries.length}</Text>
            <Text style={styles.statLabel}>Total Catatan</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{entries[0]?.mood || "📝"}</Text>
            <Text style={styles.statLabel}>Mood Terakhir</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{filteredEntries.length}</Text>
            <Text style={styles.statLabel}>Ditampilkan</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari judul atau isi diary..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Mood Filter Chips */}
        <View style={{ marginBottom: 14 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <Pressable
              style={[
                styles.chip,
                selectedMood === "ALL" && styles.chipActive,
              ]}
              onPress={() => setSelectedMood("ALL")}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedMood === "ALL" && styles.chipTextActive,
                ]}
              >
                Semua
              </Text>
            </Pressable>
            {MOOD_OPTIONS.map((m) => (
              <Pressable
                key={m.emoji}
                style={[
                  styles.chip,
                  selectedMood === m.emoji && styles.chipActive,
                ]}
                onPress={() => setSelectedMood(m.emoji)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedMood === m.emoji && styles.chipTextActive,
                  ]}
                >
                  {m.emoji} {m.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* List Diary */}
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons
                name="document-text-outline"
                size={42}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyTitle}>Belum ada catatan ditemukan</Text>
              <Text style={styles.mutedText}>
                Coba ubah filter atau tulis catatan baru di tab Tulis Baru.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <AnimatedCard key={`${selectedMood}-${item.id}`} index={index}>
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.995 }] },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/detail/[id]",
                    params: { id: String(item.id) },
                  })
                }
              >
                <View style={styles.moodBadge}>
                  <Text style={styles.moodText}>{item.mood || "📝"}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.cardTop}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.dateBadge}>
                      <Ionicons
                        name="calendar-outline"
                        size={12}
                        color={COLORS.primary}
                      />
                      <Text style={styles.dateText}>{item.diary_date}</Text>
                    </View>
                  </View>

                  <Text style={styles.bodyPreview} numberOfLines={2}>
                    {item.body}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.textMuted}
                />
              </Pressable>
            </AnimatedCard>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  wrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  badgeText: {
    color: COLORS.primary,
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
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  statusText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  statNumber: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    outlineStyle: "none" as any,
  },
  filterRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: "rgba(56, 189, 248, 0.16)",
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: COLORS.primary,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 16,
  },
  moodBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  moodText: {
    fontSize: 24,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  bodyPreview: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  mutedText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: COLORS.bg,
    fontWeight: "700",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
});