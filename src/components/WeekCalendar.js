// Compact calendar: one week by default (swipe for other weeks), "See month" expands to the full month.
// Dots mark assignment deadlines (burgundy) and tests (caramel). Tap a day to see what's on it.
import { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Icon, IconButton, Text } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { COLORS, FONTS } from '../theme';
import {
  DAY_SHORT,
  MONTHS,
  dayKey,
  formatLong,
  isSameDay,
  relativeDay,
  startOfDay,
  startOfWeek,
} from '../utils/dates';

const WEEKS_AROUND = 12; // how many weeks you can swipe back/forward
const TYPE_COLOR = { assignment: COLORS.burgundy, test: COLORS.caramel };

function DayCell({ date, events, selected, today, dim, compact, onPress }) {
  const types = [...new Set(events.map((e) => e.type))];
  return (
    <Pressable style={styles.cell} onPress={onPress}>
      <View
        style={[
          compact ? styles.monthDay : styles.weekDay,
          today && !selected && styles.todayBorder,
          selected && styles.selected,
        ]}
      >
        {!compact ? (
          <Text style={[styles.dayName, selected && { color: 'rgba(251,246,238,0.75)' }]}>
            {DAY_SHORT[date.getDay()]}
          </Text>
        ) : null}
        <Text
          style={[
            styles.dayNum,
            dim && { color: '#C9B9B2' },
            today && !selected && { color: COLORS.burgundy, fontFamily: FONTS.semibold },
            selected && { color: COLORS.cream, fontFamily: FONTS.semibold },
          ]}
        >
          {date.getDate()}
        </Text>
        <View style={styles.dots}>
          {types.map((t) => (
            <View
              key={t}
              style={[styles.dot, { backgroundColor: selected && t === 'assignment' ? COLORS.gold : TYPE_COLOR[t] }]}
            />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

export default function WeekCalendar({ events, onEventPress }) {
  const today = startOfDay(new Date());
  const [selected, setSelected] = useState(today);
  const [expanded, setExpanded] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [width, setWidth] = useState(0);
  const listRef = useRef(null);

  const byDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      (map[dayKey(e.date)] = map[dayKey(e.date)] || []).push(e);
    });
    return map;
  }, [events]);

  const weeks = useMemo(
    () => Array.from({ length: WEEKS_AROUND * 2 + 1 }, (_, i) => i - WEEKS_AROUND),
    []
  );

  const visibleWeekStart = startOfWeek(today, weekOffset);
  const headerMonth = MONTHS[(expanded ? month : visibleWeekStart).getMonth()];

  const monthCells = useMemo(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    const list = Array(month.getDay()).fill(null);
    const days = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= days; d++) list.push(new Date(y, m, d));
    while (list.length % 7) list.push(null);
    return list;
  }, [month]);

  const toggle = () => {
    if (!expanded) setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setExpanded(!expanded);
  };

  const selectedEvents = byDay[dayKey(selected)] ?? [];

  const renderWeek = ({ item: offset }) => {
    const start = startOfWeek(today, offset);
    return (
      <View style={[styles.row, { width }]}>
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          return (
            <DayCell
              key={i}
              date={d}
              events={byDay[dayKey(d)] ?? []}
              selected={isSameDay(d, selected)}
              today={isSameDay(d, today)}
              onPress={() => setSelected(d)}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View layout={LinearTransition.duration(300)}>
      <View style={styles.header}>
        <Text style={styles.title}>{expanded ? 'This month' : 'This week'}</Text>
        <Pressable onPress={toggle} hitSlop={8} style={styles.toggle}>
          <Text style={styles.toggleText}>{expanded ? 'Show less' : 'See month'}</Text>
          <Icon source={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.burgundy} />
        </Pressable>
      </View>

      <Animated.View
        layout={LinearTransition.duration(300)}
        style={styles.card}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width - 16)}
      >
        {expanded ? (
          <Animated.View key="month" entering={FadeIn.duration(300)}>
            <View style={styles.monthHeader}>
              <IconButton
                icon="chevron-left"
                size={20}
                iconColor={COLORS.muted}
                onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              />
              <Text style={styles.monthTitle}>
                {headerMonth} {month.getFullYear()}
              </Text>
              <IconButton
                icon="chevron-right"
                size={20}
                iconColor={COLORS.muted}
                onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              />
            </View>
            <View style={styles.row}>
              {DAY_SHORT.map((d) => (
                <Text key={d} style={[styles.cell, styles.weekdayHead]}>
                  {d[0]}
                </Text>
              ))}
            </View>
            {Array.from({ length: monthCells.length / 7 }, (_, w) => (
              <View key={w} style={styles.row}>
                {monthCells.slice(w * 7, w * 7 + 7).map((d, i) =>
                  d ? (
                    <DayCell
                      key={i}
                      compact
                      date={d}
                      events={byDay[dayKey(d)] ?? []}
                      selected={isSameDay(d, selected)}
                      today={isSameDay(d, today)}
                      onPress={() => setSelected(d)}
                    />
                  ) : (
                    <View key={i} style={styles.cell} />
                  )
                )}
              </View>
            ))}
            <View style={styles.legend}>
              <View style={[styles.dot, { backgroundColor: COLORS.burgundy }]} />
              <Text style={styles.legendText}>Assignment</Text>
              <View style={[styles.dot, { backgroundColor: COLORS.caramel, marginLeft: 12 }]} />
              <Text style={styles.legendText}>Test</Text>
            </View>
          </Animated.View>
        ) : width > 0 ? (
          <Animated.View key="week" entering={FadeIn.duration(300)}>
            <FlatList
              ref={listRef}
              data={weeks}
              keyExtractor={(o) => String(o)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={WEEKS_AROUND + weekOffset}
              getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
              renderItem={renderWeek}
              onMomentumScrollEnd={(e) =>
                setWeekOffset(Math.round(e.nativeEvent.contentOffset.x / width) - WEEKS_AROUND)
              }
            />
            <Text style={styles.weekHint}>
              {weekOffset === 0 ? `${headerMonth} · swipe for other weeks` : headerMonth}
            </Text>
          </Animated.View>
        ) : null}
      </Animated.View>

      {/* What's on the selected day */}
      <Animated.View layout={LinearTransition.duration(300)}>
        <Text style={styles.dayHeading}>
          {isSameDay(selected, today) ? 'Today · ' : ''}
          {formatLong(selected)}
        </Text>
        {selectedEvents.length === 0 ? (
          <Animated.Text key={`none-${dayKey(selected)}`} entering={FadeIn} style={styles.empty}>
            Nothing due — enjoy your day
          </Animated.Text>
        ) : (
          selectedEvents.map((e, i) => (
            <Animated.View key={`${dayKey(selected)}-${i}`} entering={FadeInDown.delay(i * 60)}>
              <Pressable style={styles.event} onPress={() => onEventPress?.(e)}>
                <View style={[styles.eventBar, { backgroundColor: TYPE_COLOR[e.type] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {e.title}
                  </Text>
                  <Text style={styles.eventMeta} numberOfLines={1}>
                    {e.code} · {e.type === 'test' ? e.kind : 'Assignment due'} · {relativeDay(e.date)}
                  </Text>
                </View>
                <Icon source="chevron-right" size={18} color={COLORS.muted} />
              </Pressable>
            </Animated.View>
          ))
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontFamily: FONTS.semibold, fontSize: 16, color: COLORS.maroon },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  toggleText: { fontFamily: FONTS.semibold, fontSize: 12.5, color: COLORS.burgundy },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
    padding: 8,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  weekDay: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, borderRadius: 14, minWidth: 40 },
  monthDay: { alignItems: 'center', justifyContent: 'center', width: 36, height: 42, borderRadius: 12 },
  selected: { backgroundColor: COLORS.burgundy },
  todayBorder: { borderWidth: 1.5, borderColor: 'rgba(129,23,27,0.35)' },
  dayName: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.muted },
  dayNum: { fontFamily: FONTS.medium, fontSize: 15, color: COLORS.text },
  dots: { flexDirection: 'row', gap: 3, height: 5, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  weekHint: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.muted, textAlign: 'center', marginTop: 4 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthTitle: { fontFamily: FONTS.semibold, fontSize: 14, color: COLORS.maroon },
  weekdayHead: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.muted, textAlign: 'center', marginBottom: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6, marginBottom: 2 },
  legendText: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.muted },
  dayHeading: { fontFamily: FONTS.semibold, fontSize: 13.5, color: COLORS.maroon, marginTop: 16, marginBottom: 8 },
  empty: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.muted },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  eventBar: { width: 4, height: 30, borderRadius: 2 },
  eventTitle: { fontFamily: FONTS.medium, fontSize: 13.5, color: COLORS.text },
  eventMeta: { fontFamily: FONTS.regular, fontSize: 11.5, color: COLORS.muted, marginTop: 1 },
});
