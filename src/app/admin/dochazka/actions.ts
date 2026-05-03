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

export async function setOvertimeMode(
  employeeId: string,
  year: number,
  month: number,
  mode: 'pay' | 'carry',
  carriedIn: number
) {
  const supabase = await createClient()

  const { error: e1 } = await supabase
    .from('monthly_overtime')
    .upsert(
      { employee_id: employeeId, year, month, mode, carried_in: carriedIn },
      { onConflict: 'employee_id,year,month' }
    )
  if (e1) return { error: e1.message }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data: records } = await supabase
    .from('attendance_records')
    .select('overtime')
    .eq('employee_id', employeeId)
    .gte('date', startDate)
    .lte('date', endDate)

  const totalOvertime = (records ?? []).reduce((s, r) => s + Number(r.overtime || 0), 0)
  const balance = Math.round((carriedIn + totalOvertime) * 100) / 100

  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1

  const { data: existing } = await supabase
    .from('monthly_overtime')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('year', nextYear)
    .eq('month', nextMonth)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('monthly_overtime')
      .update({ carried_in: mode === 'carry' ? balance : 0 })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('monthly_overtime')
      .insert({ employee_id: employeeId, year: nextYear, month: nextMonth, mode: 'pay', carried_in: mode === 'carry' ? balance : 0 })
  }

  revalidatePath(`/admin/dochazka/${employeeId}`)
  return { success: true }
}
