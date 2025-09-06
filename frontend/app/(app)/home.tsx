import {
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
  Animated,
} from 'react-native';
import Modal from 'react-native-modal';

import { useAuth } from '@/lib/context/auth';
import {
  ActivityIndicator,
  Button,
  FAB,
  Icon,
  IconButton,
  Portal,
  Text,
  TextInput,
  Surface,
  useTheme,
} from 'react-native-paper';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Calendar } from 'react-native-calendars';
import { addMonths, format } from 'date-fns';
import { useCreateHabitTracking } from '@/lib/hooks/CREATE/useCreateHabitTracking';
import { useGetUserHabits } from '@/lib/hooks/GET/useGetUserHabits';
import { useDeleteHabitTracking } from '@/lib/hooks/DELETE/useDeleteHabitTracking';
import { router, usePathname } from 'expo-router';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateHabit } from '@/lib/hooks/UPDATE/useUpdateHabit';
import { useUpdateHabitTracking } from '@/lib/hooks/UPDATE/useUpdateHabitTracking';
import { useDeleteHabit } from '@/lib/hooks/DELETE/useDeleteHabit';
import { createCompletionDate, formatDateForCalendar } from '@/lib/utils/dates';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface HabitCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    created_at: string;
    habit_trackings: Array<{
      id: string;
      completed_on_date: string;
    }>;
  };
  index: number;
  onEdit: (id: string) => void;
  onViewStats: (id: string) => void;
  onDayPress: (params: {
    day: { dateString: string };
    habit_id: string;
    tracking_id?: string;
  }) => void;
  onDayLongPress: (id: string) => void;
  isCreating: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  isUpdatingHabitTracking: boolean;
  selectedDate: Date;
}

const HabitCard = ({
  item,
  index,
  onEdit,
  onViewStats,
  onDayPress,
  onDayLongPress,
  isCreating,
  isDeleting,
  isUpdating,
  isUpdatingHabitTracking,
  selectedDate,
}: HabitCardProps) => {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: index * 100,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
        delay: index * 100,
      }),
    ]).start();
  }, []);

  const habitTrackings = item.habit_trackings;
  const completedDates = habitTrackings?.map(
    (tracking: { completed_on_date: string }) => {
      return formatDateForCalendar(tracking.completed_on_date);
    }
  ).filter(Boolean);

  return (
    <Animated.View
      style={[
        styles.habitCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Surface style={styles.habitCardSurface} elevation={2}>
        <View style={styles.habitHeader}>
          <View>
            <Text variant='headlineMedium' style={styles.habitTitle}>
              {item.name}
            </Text>
            <Text variant='bodyMedium' style={styles.habitDescription}>
              {item.description}
            </Text>
          </View>
          <View style={styles.habitActions}>
            <IconButton
              icon='pencil'
              onPress={() => onEdit(item.id)}
              mode='contained-tonal'
              size={12}
            />
            <IconButton
              onPress={() => onViewStats(item.id)}
              icon='chart-line'
              mode='contained-tonal'
              size={12}
            />
          </View>
        </View>
        <Calendar
          initialDate={format(selectedDate, 'yyyy-MM-dd')}
          minDate={format(new Date(item.created_at), 'yyyy-MM-dd')}
          maxDate={format(new Date(), 'yyyy-MM-dd')}
          current={format(selectedDate, 'yyyy-MM-dd')}
          theme={{
            // @ts-ignore - Calendar theme type is not properly typed
            'stylesheet.calendar.header': {
              header: { height: 0, opacity: 0 },
            },
            calendarBackground: 'transparent',
            textDisabledColor: '#ccc',
            todayTextColor: theme.colors.primary,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: '#ffffff',
            dotColor: theme.colors.primary,
            selectedDotColor: '#ffffff',
          }}
          hideExtraDays
          hideArrows
          disableArrowRight
          disableArrowLeft
          markingType='custom'
          markedDates={{
            ...completedDates?.reduce((acc: any, date: any) => {
              if (!date) return acc;
              return {
                ...acc,
                [date]: {
                  selected: true,
                  customStyles: {
                    container: {
                      backgroundColor: theme.colors.primary,
                      borderRadius: 8,
                    },
                    text: {
                      color: '#ffffff',
                      fontWeight: 'bold',
                    },
                  },
                },
              };
            }, {}),
          }}
          onDayLongPress={(day: any) => {
            if (
              isCreating ||
              isDeleting ||
              isUpdating ||
              isUpdatingHabitTracking
            )
              return;
            if (completedDates?.includes(day.dateString)) {
              const habitTracking = habitTrackings?.find(
                (tracking: { completed_on_date: string }) => 
                  formatDateForCalendar(tracking.completed_on_date) === day.dateString
              );
              if (!habitTracking) return;
              onDayLongPress(habitTracking.id);
            }
          }}
          onDayPress={(day: { timestamp: number; dateString: string }) => {
            if (isCreating || isDeleting) return;
            if (completedDates?.includes(day.dateString)) {
              const habitTracking = habitTrackings?.find(
                (tracking: { completed_on_date: string }) => 
                  formatDateForCalendar(tracking.completed_on_date) === day.dateString
              );
              if (habitTracking) {
                onDayPress({
                  day,
                  habit_id: item.id,
                  tracking_id: habitTracking.id,
                });
              }
            } else {
              onDayPress({ day, habit_id: item.id });
            }
          }}
        />
      </Surface>
    </Animated.View>
  );
};

const LoadingSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.skeletonItem,
            {
              opacity: fadeAnim,
              transform: [{ scale: 0.95 }],
            },
          ]}
        >
          <ActivityIndicator size='large' />
        </Animated.View>
      ))}
    </View>
  );
};

export default function Home() {
  const { signOut } = useAuth();
  const theme = useTheme();
  const pathname = usePathname();
  const headerAnim = useRef(new Animated.Value(0)).current;

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habitToEdit, setHabitToEdit] = useState<string | undefined>();
  const [habitToAddNote, setHabitToAddNote] = useState<string | undefined>();

  const { data: habits, isPending: habitsLoading } = useGetUserHabits();
  const { mutate: createHabitTracking, isPending: isCreating } =
    useCreateHabitTracking();
  const { mutate: deleteHabitTracking, isPending: isDeleting } =
    useDeleteHabitTracking();
  const { mutate: deleteHabit } = useDeleteHabit();
  const {
    mutate: updateHabit,
    isPending: isUpdating,
    data: updatedHabit,
  } = useUpdateHabit();
  const { mutate: updateHabitTracking, isPending: isUpdatingHabitTracking } =
    useUpdateHabitTracking();

  const handleDayPress = ({
    day,
    habit_id,
    tracking_id,
  }: {
    day: { dateString: string };
    habit_id: string;
    tracking_id?: string;
  }) => {
    if (tracking_id) {
      deleteHabitTracking(tracking_id);
    } else {
      const completionDate = createCompletionDate(day.dateString);
      createHabitTracking({ completed_on_date: completionDate, habit_id });
    }
  };

  const updateFormSchema = z.object({
    name: z.string().min(2).max(25),
    description: z.string().min(2).max(50).optional().or(z.literal('')),
  });
  const noteFormSchema = z.object({
    note: z.string().min(2).max(160),
  });

  const updateForm = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  const noteForm = useForm<z.infer<typeof noteFormSchema>>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      note: '',
    },
  });

  useEffect(() => {
    if (!updatedHabit) return;

    setHabitToEdit(undefined);
    updateForm.reset();
  }, [updatedHabit]);

  useEffect(() => {
    if (!habitToEdit) return;

    const habit = habits?.data?.find((habit) => habit.id === habitToEdit);

    updateForm.setValue('name', habit?.name ?? '');
    updateForm.setValue('description', habit?.description ?? '');
  }, [habitToEdit]);

  useEffect(() => {
    if (!habitToAddNote) return;

    const tracking = habits?.data
      ?.map((habit) => habit.data?.habit_trackings)
      .flat()
      .find((tracking) => tracking?.id === habitToAddNote);

    noteForm.setValue('note', tracking?.note ?? '');
  }, [habitToAddNote]);

  const handleHabitUpdate = async (data: z.infer<typeof updateFormSchema>) => {
    if (!habitToEdit) return;
    updateHabit({
      id: habitToEdit,
      payload: {
        name: data.name,
        description: data.description,
      },
    });
  };

  const handleHabitTrackingUpdate = async (
    data: z.infer<typeof noteFormSchema>
  ) => {
    if (!habitToAddNote) return;
    updateHabitTracking({
      id: habitToAddNote,
      payload: {
        note: data.note,
      },
    });
  };

  const incrementMonth = () => {
    setSelectedDate((prev) => {
      return addMonths(prev, 1);
    });
  };

  const decrementMonth = () => {
    setSelectedDate((prev) => {
      return addMonths(prev, -1);
    });
  };

  const thisMonth = useMemo(() => {
    return format(selectedDate, 'MMMM yyyy');
  }, [selectedDate]);


  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  if (habitsLoading || !habits?.data) {
    return <LoadingSkeleton />;
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <IconButton
            mode='contained-tonal'
            icon='arrow-left'
            onPress={decrementMonth}
          />
          <Text variant='headlineLarge' style={styles.headerTitle}>
            {thisMonth}
          </Text>
          <IconButton
            disabled={selectedDate.getMonth() === new Date().getMonth()}
            mode='contained-tonal'
            icon='arrow-right'
            onPress={incrementMonth}
          />
        </Animated.View>

        <FlatList
          style={styles.list}
          showsVerticalScrollIndicator={false}
          data={[
            ...habits.data.map((habit) => ({
              key: habit.id,
              name: habit.name,
              description: habit.description,
              ...habit,
            })),
            { key: 'spacer', name: 'spacer', description: 'spacer' },
          ]}
          renderItem={({ item, index }) => {
            if (item.key === 'spacer') {
              return <View style={{ height: SCREEN_HEIGHT * 0.1 }} />;
            }

            return (
              <HabitCard
                item={item}
                index={index}
                onEdit={setHabitToEdit}
                onViewStats={(id) => router.navigate(`/habit/${id}`)}
                onDayPress={handleDayPress}
                onDayLongPress={setHabitToAddNote}
                isCreating={isCreating}
                isDeleting={isDeleting}
                isUpdating={isUpdating}
                isUpdatingHabitTracking={isUpdatingHabitTracking}
                selectedDate={selectedDate}
              />
            );
          }}
        />

        <Portal>
          <FAB.Group
            icon={menuOpen ? 'close' : 'dots-horizontal'}
            open={menuOpen}
            visible
            onStateChange={() => setMenuOpen(!menuOpen)}
            fabStyle={styles.fab}
            actions={[
              {
                icon: 'plus',
                label: 'Add',
                onPress: () => router.replace('/create-habit'),
                style: styles.fabAction,
              },
              {
                icon:
                  pathname === '/day' || pathname.startsWith('/habit')
                    ? 'home-outline'
                    : 'view-day-outline',
                label:
                  pathname === '/day' || pathname.startsWith('/habit')
                    ? 'Home'
                    : 'Day view',
                onPress: () => {
                  if (pathname === '/day' || pathname.startsWith('/habit')) {
                    router.back();
                  } else {
                    router.navigate('/day');
                  }
                },
                style: styles.fabAction,
              },
              {
                icon: 'logout',
                label: 'Sign Out',
                onPress: signOut,
                style: styles.fabAction,
              },
            ]}
          />
        </Portal>

        <Modal
          avoidKeyboard
          isVisible={Boolean(habitToEdit)}
          onBackdropPress={() => setHabitToEdit(undefined)}
          backdropTransitionOutTiming={0}
          style={styles.modal}
        >
          <Animated.View
            style={[
              styles.modalView,
              {
                opacity: headerAnim,
                transform: [
                  {
                    scale: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalContent}>
              <Text variant='headlineMedium' style={styles.modalTitle}>
                Edit habit
              </Text>
              <Controller
                control={updateForm.control}
                name='name'
                render={({ field }) => (
                  <TextInput
                    label='Name'
                    mode='outlined'
                    value={field.value}
                    onChangeText={field.onChange}
                    autoCapitalize='none'
                    style={styles.input}
                  />
                )}
              />
              {updateForm.formState.errors.name && (
                <Text variant='labelSmall' style={styles.errorText}>
                  {updateForm.formState.errors.name.message}
                </Text>
              )}
              <Controller
                control={updateForm.control}
                name='description'
                render={({ field }) => (
                  <TextInput
                    mode='outlined'
                    label='Description'
                    value={field.value}
                    onChangeText={field.onChange}
                    autoCapitalize='none'
                    multiline
                    style={styles.input}
                  />
                )}
              />
              {updateForm.formState.errors.description && (
                <Text variant='labelSmall' style={styles.errorText}>
                  {updateForm.formState.errors.description.message}
                </Text>
              )}
              <View style={styles.modalActions}>
                <Pressable
                  disabled={isDeleting}
                  onPress={() => {
                    deleteHabit(habitToEdit as string);
                    setHabitToEdit(undefined);
                  }}
                >
                  <Icon
                    size={30}
                    source='delete-outline'
                    color={theme.colors.error}
                  />
                </Pressable>
                <View style={styles.modalButtons}>
                  <Button
                    disabled={isUpdating}
                    onPress={() => {
                      updateForm.reset();
                      setHabitToEdit(undefined);
                    }}
                    mode='outlined'
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isUpdating}
                    onPress={updateForm.handleSubmit(handleHabitUpdate)}
                    mode='contained'
                  >
                    Update
                  </Button>
                </View>
              </View>
            </View>
          </Animated.View>
        </Modal>

        <Modal
          avoidKeyboard
          isVisible={Boolean(habitToAddNote)}
          onBackdropPress={() => setHabitToAddNote(undefined)}
          backdropTransitionOutTiming={0}
          style={styles.modal}
        >
          <Animated.View
            style={[
              styles.modalView,
              {
                opacity: headerAnim,
                transform: [
                  {
                    scale: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalContent}>
              <Text variant='headlineMedium' style={styles.modalTitle}>
                Add a note
              </Text>
              <Controller
                control={noteForm.control}
                name='note'
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    autoCapitalize='none'
                    multiline
                    mode='outlined'
                    style={styles.input}
                  />
                )}
              />
              {noteForm.formState.errors.note && (
                <Text variant='labelSmall' style={styles.errorText}>
                  {noteForm.formState.errors.note.message}
                </Text>
              )}
              <View style={styles.modalButtons}>
                <Button
                  disabled={isUpdatingHabitTracking}
                  onPress={() => setHabitToAddNote(undefined)}
                  mode='outlined'
                >
                  Cancel
                </Button>
                <Button
                  disabled={isUpdatingHabitTracking}
                  onPress={noteForm.handleSubmit(handleHabitTrackingUpdate)}
                  mode='contained'
                >
                  Update
                </Button>
              </View>
            </View>
          </Animated.View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 16,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#545454',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  list: {
    width: '100%',
  },
  habitCard: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  habitCardSurface: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  habitHeader: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 16,
  },
  habitTitle: {
    fontWeight: 'bold',
  },
  habitDescription: {
    opacity: 0.7,
  },
  habitActions: {
    flexDirection: 'row',
  },
  fab: {
    backgroundColor: '#4CAF50',
  },
  fabAction: {
    backgroundColor: '#4CAF50',
  },
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 325,
    maxWidth: 325,
  },
  modalContent: {
    width: '100%',
    gap: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    width: '100%',
  },
  errorText: {
    color: 'red',
    marginTop: -8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  skeletonItem: {
    width: SCREEN_HEIGHT * 0.4,
    height: SCREEN_HEIGHT * 0.4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
