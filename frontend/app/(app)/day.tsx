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
const quarterWidth = Math.floor(windowWidth / 4);

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
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}
      >
        <View style={{ minWidth: quarterWidth }} />
        {getYesterdayTodayTomorrow.sortedEntries.map((entry) => (
          <View
            key={entry[0]}
            style={{ alignItems: 'center', minWidth: quarterWidth }}
          >
            <Text>{format(new Date(entry[1]), 'iii')}</Text>
            <Text>{new Date(entry[1]).getDate()}</Text>
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
        renderItem={({
          item,
        }: {
          item: Tables<'habits'> & {
            key: number;
            habit_trackings: Tables<'habit_trackings'>[];
          };
        }) => (
          <View
            key={item.key}
            style={{
              marginTop: 16,
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}
          >
            <Text style={{ minWidth: quarterWidth }}>{item.name}</Text>
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
                <View
                  key={`${item.id}-${entry[0]}`}
                  style={{ minWidth: quarterWidth, alignItems: 'center' }}
                >
                  {hasTrackingForDay ? (
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        borderRadius: 10,
                        backgroundColor: 'blue',
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        borderRadius: 10,
                        borderWidth: 1,
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
