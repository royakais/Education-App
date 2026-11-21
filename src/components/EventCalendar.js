// Month calendar that marks assignment deadlines and tests.
// Tap a day to see what's on it; tap an item to open its course.
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, IconButton, Text } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { COLORS } from '../theme';
import { MONTHS, dayKey, formatLong, isSameDay, relativeDay, startOfDay } from '../utils/dates';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const TYPE_COLOR = { assignment: COLORS.burgundy, test: COLORS.caramel };

export default function EventCalendar({ events, onEventPress }) {
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  // Group events by day so each cell can find its dots quickly.
  const byDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const key = dayKey(e.date);
      (map[key] = map[key] || []).push(e);
    });
    return map;
  }, [events]);

  // Build the grid: empty cells before the 1st, then the days, padded to full weeks.
  const cells = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const list = Array(month.getDay()).fill(null);
    for (let d = 1; d <= daysInMonth; d++) list.push(new Date(year, m, d));
    while (list.length % 7) list.push(null);
    return list;
  }, [month]);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const changeMonth = (delta) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  const selectedEvents = byDay[dayKey(selected)] ?? [];

  return (
    <View>
      <View style={styles.card}>
        <View style={styles.header}>
          <IconButton icon="chevron-left" iconColor={COLORS.burgundy} onPress={() => changeMonth(-1)} />
          <Text variant="titleMedium" style={styles.monthTitle}>
            {MONTHS[month.getMonth()]} {month.getFullYear()}
          </Text>
          <IconButton icon="chevron-right" iconColor={COLORS.burgundy} onPress={() => changeMonth(1)} />
        </View>

        <View style={styles.row}>
          {WEEKDAYS.map((d, i) => (
            <Text key={i} style={styles.weekday}>
              {d}
            </Text>
          ))}
        </View>

        <Animated.View key={dayKey(month)} entering={FadeIn.duration(250)}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.row}>
              {week.map((day, di) => {
                if (!day) return <View key={di} style={styles.cell} />;
                const dayEvents = byDay[dayKey(day)] ?? [];
                const isSelected = isSameDay(day, selected);
                const isToday = isSameDay(day, today);
                const types = [...new Set(dayEvents.map((e) => e.type))];
                return (
                  <Pressable key={di} style={styles.cell} onPress={() => setSelected(day)}>
                    <View
                      style={[
                        styles.dayCircle,
                        isToday && styles.today,
                        isSelected && styles.selected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && { color: COLORS.burgundy, fontWeight: 'bold' },
                          isSelected && { color: COLORS.cream, fontWeight: 'bold' },
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                    </View>
                    <View style={styles.dots}>
                      {types.map((t) => (
                        <View key={t} style={[styles.dot, { backgroundColor: TYPE_COLOR[t] }]} />
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Animated.View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.burgundy }]} />
            <Text style={styles.legendText}>Assignment due</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.caramel }]} />
            <Text style={styles.legendText}>Test / exam</Text>
          </View>
        </View>
      </View>

      {/* What's on the selected day */}
      <Text style={styles.dayHeading}>
        {isSameDay(selected, today) ? 'Today · ' : ''}
        {formatLong(selected)}
      </Text>
      {selectedEvents.length === 0 ? (
        <Animated.View key={`empty-${dayKey(selected)}`} entering={FadeIn} style={styles.emptyDay}>
          <Icon source="coffee-outline" size={20} color={COLORS.muted} />
          <Text style={styles.emptyText}>Nothing due on this day</Text>
        </Animated.View>
      ) : (
        selectedEvents.map((e, i) => (
          <Animated.View key={`${dayKey(selected)}-${i}`} entering={FadeInDown.delay(i * 60)}>
            <Pressable style={styles.event} onPress={() => onEventPress?.(e)}>
              <View style={[styles.eventBar, { backgroundColor: TYPE_COLOR[e.type] }]} />
              <View style={[styles.eventIcon, { backgroundColor: e.type === 'test' ? COLORS.goldLight : COLORS.burgundyLight }]}>
                <Icon
                  source={e.type === 'test' ? 'file-document-edit-outline' : 'clipboard-text-outline'}
                  size={20}
                  color={TYPE_COLOR[e.type]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {e.title}
                </Text>
                <Text style={styles.eventMeta} numberOfLines={1}>
                  {e.course.title} · {e.type === 'test' ? e.kind : 'Assignment'} · {relativeDay(e.date)}
                </Text>
              </View>
              <Icon source="chevron-right" size={20} color={COLORS.muted} />
            </Pressable>
          </Animated.View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthTitle: { fontWeight: 'bold', color: COLORS.maroon },
  row: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.muted,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 4,
  },
  cell: { flex: 1, alignItems: 'center', height: 48, justifyContent: 'flex-start' },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: COLORS.burgundy },
  selected: { backgroundColor: COLORS.burgundy, borderWidth: 0 },
  dayText: { color: COLORS.text },
  dots: { flexDirection: 'row', gap: 3, marginTop: 3, height: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { color: COLORS.muted, fontSize: 12 },
  dayHeading: { color: COLORS.maroon, fontWeight: 'bold', marginTop: 18, marginBottom: 10, fontSize: 15 },
  emptyDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.creamDark,
  },
  emptyText: { color: COLORS.muted },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    paddingLeft: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.creamDark,
  },
  eventBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  eventIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { color: COLORS.text, fontWeight: 'bold' },
  eventMeta: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
});
