import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
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
} from 'react-native-paper';
import { useEffect, useMemo, useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { addMonths, format } from 'date-fns';
import { useCreateHabitTracking } from '@/lib/hooks/CREATE/useCreateHabitTracking';
import { useGetUserHabits } from '@/lib/hooks/GET/useGetUserHabits';
import { useDeleteHabitTracking } from '@/lib/hooks/DELETE/useDeleteHabitTracking';
import { router } from 'expo-router';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateHabit } from '@/lib/hooks/UPDATE/useUpdateHabit';
import { useUpdateHabitTracking } from '@/lib/hooks/UPDATE/useUpdateHabitTracking';
import { useDeleteHabit } from '@/lib/hooks/DELETE/useDeleteHabit';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function Home() {
  const { signOut } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habitToEdit, setHabitToEdit] = useState<string | undefined>();
  const [habitToAddNote, setHabitToAddNote] = useState<string | undefined>();

  const { data: habits, isLoading: habitsLoading } = useGetUserHabits();
  const {
    mutate: createHabitTracking,
    isLoading: isCreating,
    variables,
  } = useCreateHabitTracking();
  const { mutate: deleteHabitTracking, isLoading: isDeleting } =
    useDeleteHabitTracking();
  const { mutate: deleteHabit, isLoading: isDeletingHabit } = useDeleteHabit();
  const {
    mutate: updateHabit,
    isLoading: isUpdating,
    data: updatedHabit,
  } = useUpdateHabit();
  const {
    mutate: updateHabitTracking,
    isLoading: isUpdatingHabitTracking,
    data: newHabitTracking,
  } = useUpdateHabitTracking();

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

  const initialDate = useMemo(() => {
    return format(selectedDate, 'yyyy-MM-dd');
  }, [selectedDate]);

  if (habitsLoading || !habits?.data) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
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
        }}
      >
        <IconButton
          mode='contained'
          icon='arrow-left'
          onPress={decrementMonth}
        />
        <Text variant='headlineLarge'>{thisMonth}</Text>
        <IconButton
          disabled={selectedDate.getMonth() === new Date().getMonth()}
          mode='contained'
          icon='arrow-right'
          onPress={incrementMonth}
        />
      </View>
      <FlatList
        style={{ width: '100%' }}
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
          const habitTrackings = item.habit_trackings;

          const completedDates = habitTrackings?.map(
            (tracking: { completed_on_date: string }) => {
              if (!tracking.completed_on_date) return null;

              return format(new Date(tracking.completed_on_date), 'yyyy-MM-dd');
            }
          );

          if (item.key === 'spacer') {
            return <View style={{ height: SCREEN_HEIGHT * 0.1 }} />;
          }

          return (
            <View
              style={{
                marginVertical: index > 0 ? 24 : 0,
                paddingHorizontal: 24,
              }}
            >
              <View
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}
              >
                <View>
                  <Text variant='headlineMedium'>{item.name}</Text>
                  <Text variant='bodyMedium'>{item.description}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <IconButton
                    icon='pencil'
                    onPress={() => setHabitToEdit(item.id)}
                  />
                  <IconButton
                    onPress={() => router.navigate(`/habit/${item.id}`)}
                    icon='chart-line'
                  />
                </View>
              </View>
              <Calendar
                initialDate={initialDate}
                maxDate={format(new Date(), 'yyyy-MM-dd')}
                theme={{
                  // @ts-ignore
                  'stylesheet.calendar.header': {
                    header: { height: 0, opacity: 0 },
                  },
                  calendarBackground: 'transparent',
                  textDisabledColor: '#545454',
                }}
                hideExtraDays
                hideArrows
                disableArrowRight
                disableArrowLeft
                markedDates={{
                  ...completedDates?.reduce((acc: any, date: any) => {
                    if (!date) return acc;

                    return {
                      ...acc,
                      [date]: {
                        selected: true,
                      },
                    };
                  }, {}),
                  // Optimistically add the new tracking to the calendar
                  ...(isCreating
                    ? {
                        [variables.completed_on_date]: {
                          selected: true,
                        },
                      }
                    : {}),
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
                        format(
                          new Date(tracking.completed_on_date),
                          'yyyy-MM-dd'
                        ) === day.dateString
                    );

                    if (!habitTracking) return;

                    setHabitToAddNote(habitTracking.id);
                  }
                }}
                onDayPress={(day: any) => {
                  if (isCreating || isDeleting) return;
                  if (completedDates?.includes(day.dateString)) {
                    const habitTracking = habitTrackings?.find(
                      (tracking: { completed_on_date: string }) =>
                        format(
                          new Date(tracking.completed_on_date),
                          'yyyy-MM-dd'
                        ) === day.dateString
                    );

                    if (habitTracking) {
                      deleteHabitTracking(habitTracking.id);
                    }
                  } else {
                    createHabitTracking({
                      habit_id: item.id,
                      completed_on_date: new Date(day.timestamp).toISOString(),
                    });
                  }
                }}
              />
            </View>
          );
        }}
      />
      <Portal>
        <FAB.Group
          icon={menuOpen ? 'close' : 'dots-horizontal'}
          open={menuOpen}
          visible
          onStateChange={() => setMenuOpen(!menuOpen)}
          actions={[
            {
              icon: 'plus',
              label: 'Add',
              onPress: () => router.navigate('/create-habit'),
            },
            {
              icon: 'view-day-outline',
              label: 'Day view',
              onPress: () => router.navigate('/day'),
            },
            { icon: 'logout', label: 'Sign Out', onPress: signOut },
          ]}
        />
        {/* <Dialog
          visible={Boolean(habitToRecord) && !isEmpty(habitToRecord)}
          onDismiss={() => setHabitToRecord(undefined)}
        >
          <Dialog.Title>Record Habit</Dialog.Title>
          <Dialog.Content>
            <Text>{`Record progress for ${habitToRecord?.habitId}`}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setHabitToRecord(undefined)}>
              Nevermind
            </Button>
            <Button onPress={handleAddHabitTracking}>Record</Button>
          </Dialog.Actions>
        </Dialog> */}
      </Portal>
      <Modal
        avoidKeyboard
        isVisible={Boolean(habitToEdit)}
        onBackdropPress={() => setHabitToEdit(undefined)}
      >
        <View style={styles.container}>
          <View style={styles.modalView}>
            <View style={{ gap: 8, width: '100%' }}>
              <Text variant='headlineMedium'>Edit habit</Text>
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
                  />
                )}
              />
              {updateForm.formState.errors.name && (
                <Text variant='labelSmall' style={{ color: 'red' }}>
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
                  />
                )}
              />
              {updateForm.formState.errors.description && (
                <Text variant='labelSmall' style={{ color: 'red' }}>
                  {updateForm.formState.errors.description.message}
                </Text>
              )}
              <View
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Pressable
                  disabled={isDeleting}
                  onPress={() => {
                    deleteHabit(habitToEdit as string);
                    setHabitToEdit(undefined);
                  }}
                >
                  <Icon size={30} source='delete-outline' color='red' />
                </Pressable>
                <View
                  style={{
                    flexDirection: 'row',
                  }}
                >
                  <Button
                    disabled={isUpdating}
                    onPress={() => {
                      updateForm.reset();
                      setHabitToEdit(undefined);
                    }}
                  >
                    Nevermind
                  </Button>
                  <Button
                    disabled={isUpdating}
                    onPress={updateForm.handleSubmit(handleHabitUpdate)}
                  >
                    Update
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        avoidKeyboard
        isVisible={Boolean(habitToAddNote)}
        onBackdropPress={() => setHabitToAddNote(undefined)}
      >
        <View style={styles.container}>
          <View style={styles.modalView}>
            <View style={{ gap: 8, width: '100%' }}>
              <Text variant='headlineMedium'>Add a note</Text>
              <Controller
                control={noteForm.control}
                name='note'
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    autoCapitalize='none'
                    multiline
                  />
                )}
              />
              {noteForm.formState.errors.note && (
                <Text variant='labelSmall' style={{ color: 'red' }}>
                  {noteForm.formState.errors.note.message}
                </Text>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  disabled={isUpdatingHabitTracking}
                  onPress={() => setHabitToAddNote(undefined)}
                >
                  Nevermind
                </Button>
                <Button
                  disabled={isUpdatingHabitTracking}
                  onPress={noteForm.handleSubmit(handleHabitTrackingUpdate)}
                >
                  Update
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
