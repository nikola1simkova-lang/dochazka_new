export type Profile = {
  id: string
  name: string
  email?: string
  role: 'admin' | 'employee'
  created_at: string
}

export type AttendanceRecord = {
  id: number
  employee_id: string
  date: string
  time_from: string
  time_to: string
  break_minutes: 0 | 30 | 60
  location: string | null
  hours_worked: number
  overtime: number
  submitted_at: string
  created_at: string
}
