import { LoadingState } from '@/components/LoadingState';
import { monthLabels } from '@/lib/constants/Dates';
import { useGetHabitById } from '@/lib/hooks/GET/useGetHabitById';
import { countStreaks } from '@/lib/utils/streaks';
import { HabitTrackingsRecord } from '@/types/pocketbase-types';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Text } from 'react-native-paper';

export default function Habit() {
  const params = useLocalSearchParams();

  const { data: habit, isPending: habitLoading } = useGetHabitById(
    params.id as string
  );

  const trackings = useMemo(() => {
    if (!habit?.data?.habit_trackings) return [];

    return habit.data.habit_trackings;
  }, [habit]);

  const trackingsData = useMemo(() => {
    if (!trackings) return [];

    const monthsData: { [key: string]: { value: number; label: string } } = {};

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;
      monthsData[monthKey] = { value: 0, label: monthLabels[date.getMonth()] };
    }

    trackings.forEach((tracking: HabitTrackingsRecord) => {
      const completedDate = new Date(tracking.completed_on_date as string);
      const monthKey = `${completedDate.getFullYear()}-${String(
        completedDate.getMonth() + 1
      ).padStart(2, '0')}`;
      if (monthsData[monthKey]) {
        monthsData[monthKey].value += 1;
      }
    });

    return Object.values(monthsData);
  }, [trackings]);

  const { longestStreak, currentStreak } = useMemo(() => {
    if (!trackings || trackings.length === 0)
      return { longestStreak: 0, currentStreak: 0 };

    const dateStrings: string[] = trackings.map(
      (tracking: HabitTrackingsRecord) => tracking.completed_on_date as string
    );

    return countStreaks(dateStrings);
  }, [trackings]);

  if (habitLoading || !habit || !Boolean(trackingsData?.length)) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: habit.data.name }} />
      <ScrollView>
        <View style={{ width: '100%' }}>
          <BarChart
            noOfSections={3}
            frontColor={'#177AD5'}
            barBorderTopRightRadius={3}
            barBorderTopLeftRadius={3}
            data={trackingsData}
          />
        </View>
        <View>
          <Text variant='bodyLarge'>{`Longest streak: ${longestStreak}`}</Text>
          <Text variant='bodyLarge'>{`Current streak: ${currentStreak}`}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
