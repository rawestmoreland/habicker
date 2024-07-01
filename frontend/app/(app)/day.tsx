import { LoadingState } from '@/components/LoadingState';
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
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';

const windowWidth = Dimensions.get('window').width - 40;
const gridWidth = Math.floor(windowWidth / 12);

export default function DayView() {
  const { data: habits, isLoading: habitsLoading } = useGetUserHabits();

  const getYesterdayTodayTomorrow = useMemo(() => {
    const today = startOfToday();
    const yesterday = startOfYesterday();
    const twoDaysAgo = subDays(yesterday, 1);

    const results = { yesterday, today, twoDaysAgo };

    const entries = Object.entries(results);

    const sortedEntries = entries.sort(
      // @ts-ignore
      ([, dateA], [, dateB]) => new Date(dateA) - new Date(dateB)
    );

    return { values: { yesterday, today, twoDaysAgo }, sortedEntries };
  }, []);

  if (habitsLoading || !habits) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}></Text>
        {getYesterdayTodayTomorrow.sortedEntries.map(([key, date]) => (
          <Text key={key} style={styles.headerCell}>
            {format(date, 'MMM d')}
          </Text>
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
        renderItem={({ item }) => {
          return (
            <View key={item.key} style={styles.row}>
              <Text style={styles.activityCell}>{item.name}</Text>
              {getYesterdayTodayTomorrow.sortedEntries.map((entry, index) => {
                const hasTrackingForDay = Boolean(item.habit_trackings.length)
                  ? item.habit_trackings.some(
                      (tracking: Tables<'habit_trackings'>) => {
                        return isSameDay(
                          new Date(tracking.completed_on_date as string),
                          new Date(entry[1])
                        );
                      }
                    )
                  : false;

                return (
                  <View style={styles.cell} key={index}>
                    <View
                      style={[
                        styles.circle,
                        hasTrackingForDay ? styles.complete : styles.incomplete,
                      ]}
                    ></View>
                  </View>
                );
              })}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  activityCell: {
    flex: 1,
    textAlign: 'left',
    padding: 8,
    fontWeight: 'bold',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  circle: {
    height: 20,
    width: 20,
    borderRadius: 10,
  },
  complete: {
    backgroundColor: 'blue',
  },
  incomplete: {
    borderWidth: 2,
  },
});
