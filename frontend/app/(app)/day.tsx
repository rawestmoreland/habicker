import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { LoadingState } from '@/components/LoadingState';
import { useCreateHabitTracking } from '@/lib/hooks/CREATE/useCreateHabitTracking';
import { useDeleteHabitTracking } from '@/lib/hooks/DELETE/useDeleteHabitTracking';
import { useGetUserHabits } from '@/lib/hooks/GET/useGetUserHabits';
import { Tables } from '@/types/supabase';
import {
  format,
  isSameDay,
  startOfToday,
  startOfYesterday,
  subDays,
} from 'date-fns';
import { useMemo } from 'react';
import { useIsMutating } from '@tanstack/react-query';
import { createCompletionDate } from '@/lib/utils/dates';

const windowWidth = Dimensions.get('window').width - 40;

const DayView = () => {
  const { data: habits, isPending: habitsLoading } = useGetUserHabits();
  const { mutate: createHabitTracking, isPending: isCreatingTracking } =
    useCreateHabitTracking();
  const { isPending: isDeletingTracking, mutate: deleteTracking } =
    useDeleteHabitTracking();
  const isMutating = useIsMutating();

  const getYesterdayTodayTomorrow = useMemo(() => {
    const today = startOfToday();
    const yesterday = startOfYesterday();
    const twoDaysAgo = subDays(yesterday, 1);

    const results = { yesterday, today, twoDaysAgo };
    const entries = Object.entries(results);
    const sortedEntries = entries.sort(
      ([, dateA], [, dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime()
    );

    return { values: { yesterday, today, twoDaysAgo }, sortedEntries };
  }, []);

  if (habitsLoading || !habits) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.habitInfoCell}>
          <Text style={styles.headerText}>Habit</Text>
        </View>
        {getYesterdayTodayTomorrow.sortedEntries.map(([key, date]) => (
          <View key={key} style={styles.dateCell}>
            <Text style={styles.headerText}>{format(date, 'MMM d')}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={habits?.data?.map(
          (
            habit: Tables<'habits'> & {
              habit_trackings: Tables<'habit_trackings'>[];
            }
          ) => ({
            key: habit.id,
            ...habit,
          })
        )}
        renderItem={({ item }) => (
          <View style={styles.habitRow}>
            <View style={styles.habitInfoCell}>
              <Text style={styles.habitName}>{item.name}</Text>
            </View>

            {getYesterdayTodayTomorrow.sortedEntries.map((entry, index) => {
              const hasTrackingForDay = Boolean(item.habit_trackings.length)
                ? item.habit_trackings.some(
                    (tracking: Tables<'habit_trackings'>) =>
                      isSameDay(
                        new Date(tracking.completed_on_date as string),
                        new Date(entry[1])
                      )
                  )
                : false;
              const trackingForDay = item.habit_trackings.find((tracking) =>
                isSameDay(
                  new Date(tracking.completed_on_date as string),
                  new Date(entry[1])
                )
              );

              return (
                <View style={styles.dateCell} key={index}>
                  <Pressable
                    disabled={
                      isCreatingTracking ||
                      isDeletingTracking ||
                      Boolean(isMutating)
                    }
                    onPress={() => {
                      if (isMutating) return;

                      if (hasTrackingForDay && trackingForDay) {
                        deleteTracking(trackingForDay.id);
                      } else {
                        const completionDate = createCompletionDate(
                          format(entry[1], 'yyyy-MM-dd')
                        );
                        createHabitTracking({
                          habit_id: item.id,
                          completed_on_date: completionDate,
                        });
                      }
                    }}
                    style={[
                      styles.completionButton,
                      hasTrackingForDay
                        ? styles.completedButton
                        : styles.incompletedButton,
                    ]}
                  >
                    <Icon
                      source={hasTrackingForDay ? 'check' : 'close'}
                      size={24}
                      color={hasTrackingForDay ? 'white' : '#333'}
                    />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  habitRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  habitInfoCell: {
    flex: 2,
    justifyContent: 'center',
  },
  dateCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  completionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ccc',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  incompletedButton: {
    backgroundColor: '#ccc',
  },
});

export default DayView;
