import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';
import { LoadingState } from '@/components/LoadingState';
import { useGetHabitTrackings } from '@/lib/hooks/GET/useGetHabitTrackings';
import { useGetHabitById } from '@/lib/hooks/GET/useGetHabitById';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  differenceInDays,
} from 'date-fns';

export default function HabitDetailScreen() {
  const params = useLocalSearchParams();
  const habitId = params.id as string;

  const { data: trackings, isPending } = useGetHabitTrackings(habitId);
  const { data: habit } = useGetHabitById(habitId);

  const stats = useMemo(() => {
    if (!trackings?.data) return null;

    const today = new Date();
    const habitStartDate = habit?.data?.created_at
      ? parseISO(habit?.data?.created_at)
      : today;
    const sixMonthsAgo = subMonths(today, 5);

    // For the graph, we'll show last 6 months
    const graphMonths = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: endOfMonth(today),
    });

    // Calculate total days since habit creation
    const totalDaysSinceCreation = differenceInDays(today, habitStartDate) + 1;
    const totalCompletedDays = trackings.data.length;
    const overallCompletionRate = Math.round(
      (totalCompletedDays / totalDaysSinceCreation) * 100
    );

    // Calculate monthly stats for the graph
    const monthlyStats = graphMonths.map((month) => {
      const isCurrentMonth =
        month.getFullYear() === today.getFullYear() &&
        month.getMonth() === today.getMonth();

      let daysInMonth;
      if (isCurrentMonth) {
        // Only include days up to today
        daysInMonth = eachDayOfInterval({
          start: startOfMonth(month),
          end: today,
        });
      } else {
        daysInMonth = eachDayOfInterval({
          start: startOfMonth(month),
          end: endOfMonth(month),
        });
      }

      const completedDays = daysInMonth.filter((day) =>
        trackings.data.some((tracking) =>
          isSameDay(new Date(tracking.completed_on_date), day)
        )
      ).length;

      const completionRate = (completedDays / daysInMonth.length) * 100;

      return {
        month: format(month, 'MMM'),
        completionRate: Math.round(completionRate),
        totalDays: daysInMonth.length,
        completedDays,
      };
    });

    return {
      monthlyStats,
      chartData: monthlyStats.map((stat) => ({
        value: stat.completionRate,
        label: stat.month,
        dataPointText: `${stat.completionRate}%`,
      })),
      overallStats: {
        totalDaysSinceCreation,
        totalCompletedDays,
        overallCompletionRate,
      },
    };
  }, [trackings, habit?.data?.created_at]);

  if (isPending || !stats) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{habit?.data?.name}</Text>

        {/* Overall Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats.overallStats.overallCompletionRate}%
            </Text>
            <Text style={styles.statLabel}>Overall Completion</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats.overallStats.totalCompletedDays}
            </Text>
            <Text style={styles.statLabel}>Days Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats.overallStats.totalDaysSinceCreation}
            </Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
        </View>

        {/* Completion Rate Graph */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>6-Month Completion Rate</Text>
          <LineChart
            data={stats.chartData}
            height={250}
            spacing={40}
            initialSpacing={20}
            color='#007AFF'
            thickness={2}
            startFillColor='rgba(0, 122, 255, 0.3)'
            endFillColor='rgba(0, 122, 255, 0.01)'
            startOpacity={0.9}
            endOpacity={0.2}
            backgroundColor='white'
            yAxisLabelWidth={40}
            yAxisTextStyle={{ color: '#666' }}
            xAxisLabelTextStyle={{ color: '#666' }}
            hideRules
            yAxisThickness={1}
            xAxisThickness={1}
            yAxisTextNumberOfLines={1}
            yAxisLabelPrefix=''
            yAxisLabelSuffix='%'
            curved
            showDataPointOnFocus
            maxValue={100}
            noOfSections={5}
          />
        </View>

        {/* Monthly Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Monthly Breakdown</Text>
          {stats.monthlyStats.map((monthStat, index) => (
            <View key={index} style={styles.monthRow}>
              <Text style={styles.monthName}>{monthStat.month}</Text>
              <View style={styles.monthStats}>
                <Text style={styles.monthCompletion}>
                  {monthStat.completionRate}% completed
                </Text>
                <Text style={styles.monthDays}>
                  {monthStat.completedDays}/{monthStat.totalDays} days
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  breakdownContainer: {
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  monthName: {
    fontSize: 16,
    fontWeight: '500',
  },
  monthStats: {
    alignItems: 'flex-end',
  },
  monthCompletion: {
    fontSize: 16,
    color: '#007AFF',
  },
  monthDays: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
