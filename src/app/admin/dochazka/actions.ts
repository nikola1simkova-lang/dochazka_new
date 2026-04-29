'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertAttendanceRecord(formData: FormData) {
  const employee_id = formData.get('employee_id') as string
  const date = formData.get('date') as string
  const time_from = formData.get('time_from') as string
  const time_to = formData.get('time_to') as string
  const break_minutes = parseInt(formData.get('break_minutes') as string, 10)
  const location = (formData.get('location') as string).trim() || null

  if (!employee_id || !date || !time_from || !time_to) {
    return { error: 'Vyplňte všechna povinná pole' }
  }
  if (![0, 30, 60].includes(break_minutes)) {
    return { error: 'Neplatná hodnota přestávky' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('attendance_records')
    .upsert(
      { employee_id, date, time_from, time_to, break_minutes, location, submitted_at: new Date().toISOString() },
      { onConflict: 'employee_id,date' }
    )

  if (error) return { error: error.message }
  revalidatePath(`/admin/dochazka/${employee_id}`)
  return { success: true }
}

export async function deleteAttendanceRecord(id: number, employeeId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('attendance_records').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/dochazka/${employeeId}`)
  return { success: true }
}
