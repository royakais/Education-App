// Centered course carousel. The active card sits in the middle (maroon, full size);
// the previous/next cards peek in from the sides (smaller, faded).
// Below it, the active course's info fades out while swiping and fades back in when a card settles.
import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  scrollTo,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import { COLORS, FONTS } from '../theme';
import { formatDayMonth } from '../utils/dates';
import { generateCrn } from '../utils/crn';

const GAP = 16;

function CourseCard({ item, index, scrollX, itemWidth, cardWidth, onPress }) {
  const input = [(index - 1) * itemWidth, index * itemWidth, (index + 1) * itemWidth];

  // Size and opacity depend on how close this card is to the center.
  const cardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, input, [0.5, 1, 0.5], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(scrollX.value, input, [0.84, 1, 0.84], Extrapolation.CLAMP) }],
  }));
  // The maroon layer fades in only when the card is in the center.
  const activeLayer = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, input, [0, 1, 0], Extrapolation.CLAMP),
  }));

  const content = (light) => (
    <>
      <View style={[styles.tick, light && { backgroundColor: COLORS.gold, width: 34 }]} />
      <View>
        <Text style={[styles.code, light && styles.codeLight]}>{item.info.code}</Text>
        <Text style={[styles.crn, light && { color: 'rgba(251,246,238,0.75)' }]}>
          CRN {generateCrn(item.course.id)}
        </Text>
      </View>
    </>
  );

  return (
    <View style={{ width: itemWidth, alignItems: 'center' }}>
      <Pressable onPress={onPress}>
        <Animated.View style={[styles.card, { width: cardWidth }, cardStyle]}>
          {content(false)}
          <Animated.View style={[StyleSheet.absoluteFill, activeLayer]}>
            <LinearGradient
              colors={[COLORS.burgundy, COLORS.maroon]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, styles.cardInner]}
            >
              <View style={styles.circle} />
              {content(true)}
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

// Soft rose glow behind the course info (no borders, fades into the background).
function Glow() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor="#F0D6CD" stopOpacity="0.8" />
          <Stop offset="0.5" stopColor="#F4E2DC" stopOpacity="0.45" />
          <Stop offset="1" stopColor={COLORS.cream} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
    </Svg>
  );
}

function CourseInfo({ item, onOpen }) {
  const { course, info } = item;
  const next = info.nextAssignment;
  const lecture = info.recentLectures[0];
  return (
    <View style={styles.info}>
      <Glow />
      <Text style={styles.courseName} numberOfLines={1}>
        {course.title}
      </Text>

      <Text style={styles.label}>
        {next ? `NEXT DUE · ${formatDayMonth(next.dueDate).toUpperCase()}` : 'NEXT DUE'}
      </Text>
      <Text style={styles.value} numberOfLines={1}>
        {next ? next.title : 'Nothing due — all caught up'}
      </Text>

      <View style={styles.sep} />

      <Text style={styles.label}>LAST LECTURE</Text>
      <Text style={styles.value} numberOfLines={1}>
        {lecture ? lecture.title : 'No lectures yet'}
      </Text>

      <Pressable style={styles.openBtn} onPress={onOpen} hitSlop={6}>
        <Text style={styles.openText}>Open course →</Text>
      </Pressable>
    </View>
  );
}

export default function CourseCarousel({ items, onOpenCourse, onIndexChange }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(220, Math.round(width * 0.52));
  const itemWidth = cardWidth + GAP;
  const sidePadding = (width - itemWidth) / 2;

  const scrollRef = useAnimatedRef();
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  // When the nearest card changes, swap the info below (it is faded out at that moment).
  useAnimatedReaction(
    () => Math.round(scrollX.value / itemWidth),
    (current, previous) => {
      if (current !== previous) {
        scheduleOnRN(setIndex, current);
        if (onIndexChange) scheduleOnRN(onIndexChange, current);
      }
    }
  );

  // Info fades out while between two cards and is fully visible when a card is centered.
  const infoStyle = useAnimatedStyle(() => {
    const p = scrollX.value / itemWidth;
    const distance = Math.abs(p - Math.round(p)); // 0 = centered, 0.5 = halfway
    return { opacity: interpolate(distance, [0, 0.35], [1, 0], Extrapolation.CLAMP) };
  });

  const goTo = (i) => {
    scheduleOnUI(() => {
      'worklet';
      scrollTo(scrollRef, i * itemWidth, 0, true);
    });
  };

  const safeIndex = Math.min(Math.max(index, 0), items.length - 1);

  return (
    <View>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: sidePadding, paddingVertical: 10 }}
      >
        {items.map((item, i) => (
          <CourseCard
            key={item.course.id}
            item={item}
            index={i}
            scrollX={scrollX}
            itemWidth={itemWidth}
            cardWidth={cardWidth}
            onPress={() => (i === safeIndex ? onOpenCourse(item.course) : goTo(i))}
          />
        ))}
      </Animated.ScrollView>

      <View style={styles.pager}>
        {items.map((item, i) => (
          <View key={item.course.id} style={[styles.dot, i === safeIndex && styles.dotActive]} />
        ))}
      </View>

      <Animated.View style={infoStyle}>
        {/* Re-mounts for every new course → smooth fade-in that rises into place. */}
        <Animated.View
          key={items[safeIndex].course.id}
          entering={FadeInDown.duration(650).easing(Easing.out(Easing.cubic))}
        >
          <CourseInfo item={items[safeIndex]} onOpen={() => onOpenCourse(items[safeIndex].course)} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 128,
    borderRadius: 26,
    padding: 18,
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.creamDark,
    shadowColor: COLORS.maroon,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  cardInner: { borderRadius: 26, padding: 18, justifyContent: 'space-between', overflow: 'hidden' },
  circle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    right: -45,
    top: -45,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  tick: { width: 26, height: 4, borderRadius: 2, backgroundColor: COLORS.creamDark },
  code: { fontFamily: FONTS.semibold, fontSize: 24, color: COLORS.burgundy, letterSpacing: 0.5 },
  codeLight: { color: COLORS.cream, fontSize: 28, lineHeight: 36 },
  crn: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.muted },
  pager: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E0D1C4' },
  dotActive: { width: 18, backgroundColor: COLORS.burgundy },
  info: { alignItems: 'center', marginTop: 6, paddingVertical: 22, paddingHorizontal: 36 },
  courseName: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.muted, letterSpacing: 0.3 },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: COLORS.muted,
    marginTop: 12,
  },
  value: { fontFamily: FONTS.medium, fontSize: 15, color: COLORS.text, marginTop: 2, textAlign: 'center' },
  sep: { width: 26, height: 1, backgroundColor: COLORS.creamDark, marginTop: 12 },
  openBtn: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(129,23,27,0.18)',
    backgroundColor: 'rgba(255,252,247,0.8)',
  },
  openText: { fontFamily: FONTS.semibold, fontSize: 12.5, color: COLORS.burgundy },
});
