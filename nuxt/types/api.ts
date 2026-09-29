// Response shapes of the NestJS API.

export interface ErrorResponse {
  statusCode: number
  error: string
  message: string
  details: { field: string; messages: string[] }[]
  path: string
  timestamp: string
}

export interface LoginResponse {
  accessToken: string
  expiresIn: number
  pilot: { name: string }
}

export interface PilotProfile {
  name: string
  totalFlightHours: number
  avatarUrl: string
}

export type ChartRange = '1w' | '1m' | '3m' | '6m' | '1y'
export type LimitStatus = 'safe' | 'warning' | 'over'

export interface ChartPoint {
  date: string
  value: number
  isToday: boolean
  isFuture: boolean
  overLimit: boolean
  partialWindow: boolean
}

export interface LimitCard {
  key: 'daily' | 'weekly' | 'monthly' | 'annual'
  label: string
  current: number
  limit: number
  windowDays: number
  percent: number
  status: LimitStatus
}

export interface FlightHoursSummary {
  range: ChartRange
  today: string
  windowDays: number
  limit: number
  yMax: number
  points: ChartPoint[]
  cards: LimitCard[]
}

export type DocumentStatus = 'expired' | 'soon' | 'safe'

export interface PilotDocument {
  id: string
  label: string
  expiryDate: string
  daysRemaining: number
  status: DocumentStatus
}

export interface DocumentsResponse {
  today: string
  warningDays: number
  documents: PilotDocument[]
}

export interface ScheduleEntry {
  id: string
  date: string
  status: number
  baseName: string
  baseColor: string
  dutyType: string
  countSchedules: number
  countLogbooks: number
  remaining: number
  isComplete: boolean
  isToday: boolean
}

export interface LegendItem {
  code: string
  label: string
  color: string
}

export interface SchedulesResponse {
  year: number
  month: number
  today: string
  entries: ScheduleEntry[]
  legend: LegendItem[]
}
