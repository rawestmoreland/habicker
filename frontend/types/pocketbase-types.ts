/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
  HabitTrackings = "habit_trackings",
  Habits = "habits",
  Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString
  created: IsoDateString
  updated: IsoDateString
  collectionId: string
  collectionName: Collections
  expand?: T
}

export type AuthSystemFields<T = never> = {
  email: string
  emailVisibility: boolean
  username: string
  verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type HabitTrackingsRecord = {
  id: string
  completed_on_date?: IsoDateString
  habit_id?: RecordIdString
  note?: string
}

export type HabitsRecord = {
  description?: string
  name?: string
  user?: RecordIdString
}

export type UsersRecord = {
  avatar?: string
  name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type HabitTrackingsResponse<Texpand = unknown> = Required<HabitTrackingsRecord> & BaseSystemFields<Texpand>
export type HabitsResponse<Texpand = unknown> = Required<HabitsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  habit_trackings: HabitTrackingsRecord
  habits: HabitsRecord
  users: UsersRecord
}

export type CollectionResponses = {
  habit_trackings: HabitTrackingsResponse
  habits: HabitsResponse
  users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: 'habit_trackings'): RecordService<HabitTrackingsResponse>
  collection(idOrName: 'habits'): RecordService<HabitsResponse>
  collection(idOrName: 'users'): RecordService<UsersResponse>
}
