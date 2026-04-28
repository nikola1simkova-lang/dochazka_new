'use client'

import { useRouter } from 'next/navigation'
import type { Profile, AttendanceRecord } from '@/types'
import * as XLSX from 'xlsx'

type Props = {
  employee: Profile
  records: AttendanceRecord[]
  year: number
  month: number
  employeeId: string
}

const CZECH_MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
const CZECH_DAYS = ['Ne','Po','Út','St','Čt','Pá','So']

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const count = new Date(year, month, 0).getDate()
  for (let d = 1; d <= count; d++) {
    days.push(new Date(year, month - 1, d))
  }
  return days
}

function fmt(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6
}

function fmtOvertime(val: number): string {
  return `${val >= 0 ? '+' : ''}${Number(val).toFixed(2)}`
}

export default function MonthlyAttendanceTable({ employee, records, year, month, employeeId }: Props) {
  const router = useRouter()
  const days = getDaysInMonth(year, month)

  const recordMap = new Map<string, AttendanceRecord>()
  records.forEach(r => recordMap.set(r.date, r))

  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }

  const totalHours = records.reduce((s, r) => s + Number(r.hours_worked || 0), 0)
  const totalOvertime = records.reduce((s, r) => s + Number(r.overtime || 0), 0)

  function handleExport() {
    const rows = days.map(day => {
      const dateStr = fmt(day)
      const r = recordMap.get(dateStr)
      return {
        'Datum': `${day.getDate()}. ${day.getMonth() + 1}.`,
        'Den': CZECH_DAYS[day.getDay()],
        'Jméno': employee.name,
        'Od': r?.time_from ?? '',
        'Do': r?.time_to ?? '',
        'Přestávka (min)': r?.break_minutes ?? '',
        'Odpracováno (h)': r ? Number(r.hours_worked).toFixed(2) : '',
        'Přesčas (h)': r ? fmtOvertime(r.overtime) : '',
        'Místo práce': r?.location ?? '',
        'Čas zápisu': r?.submitted_at ? new Date(r.submitted_at).toLocaleString('cs-CZ') : '',
        'Typ dne': isWeekend(day) ? 'Víkend' : 'Pracovní den',
      }
    })
    rows.push({
      'Datum': 'CELKEM',
      'Den': '',
      'Jméno': employee.name,
      'Od': '',
      'Do': '',
      'Přestávka (min)': '' as any,
      'Odpracováno (h)': totalHours.toFixed(2),
      'Přesčas (h)': fmtOvertime(totalOvertime),
      'Místo práce': '',
      'Čas zápisu': '',
      'Typ dne': '',
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `${CZECH_MONTHS[month - 1]} ${year}`)
    XLSX.writeFile(wb, `dochazka_${employee.name.replace(/\s+/g, '_')}_${year}_${String(month).padStart(2, '0')}.xlsx`)
  }

  return (
    <div className="space-y-4">
      {/* Navigace měsíce */}
      <div className="flex items-center justify-between bg-white rounded-xl border px-4 py-3">
        <button
          onClick={() => router.push(`/admin/dochazka/${employeeId}?year=${prevMonth.year}&month=${prevMonth.month}`)}
          className="text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
        >
          ←
        </button>
        <span className="font-semibold">{CZECH_MONTHS[month - 1]} {year}</span>
        <button
          onClick={() => router.push(`/admin/dochazka/${employeeId}?year=${nextMonth.year}&month=${nextMonth.month}`)}
          className="text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
        >
          →
        </button>
      </div>

      {/* Souhrn */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Záznamy</p>
          <p className="text-2xl font-bold">{records.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Odpracováno</p>
          <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Přesčas</p>
          <p className={`text-2xl font-bold ${totalOvertime >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {fmtOvertime(totalOvertime)}h
          </p>
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          ↓ Stáhnout Excel
        </button>
      </div>

      {/* Tabulka — desktop */}
      <div className="bg-white rounded-xl border overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">Datum</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Den</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Od</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Do</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Přestávka</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Odprac.</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Přesčas</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Místo</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">Čas zápisu</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {days.map(day => {
              const dateStr = fmt(day)
              const record = recordMap.get(dateStr)
              const isWe = isWeekend(day)
              return (
                <tr
                  key={dateStr}
                  className={`${isWe ? 'bg-gray-50 text-gray-400' : !record ? 'bg-yellow-50' : ''}`}
                >
                  <td className="px-3 py-2 font-medium whitespace-nowrap">
                    {day.getDate()}. {day.getMonth() + 1}.
                  </td>
                  <td className="px-3 py-2">{CZECH_DAYS[day.getDay()]}</td>
                  <td className="px-3 py-2">{record?.time_from ?? '—'}</td>
                  <td className="px-3 py-2">{record?.time_to ?? '—'}</td>
                  <td className="px-3 py-2">{record ? `${record.break_minutes} min` : '—'}</td>
                  <td className="px-3 py-2">{record ? `${Number(record.hours_worked).toFixed(2)}h` : '—'}</td>
                  <td className={`px-3 py-2 font-medium ${record ? (record.overtime >= 0 ? 'text-green-600' : 'text-red-500') : ''}`}>
                    {record ? `${fmtOvertime(record.overtime)}h` : '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-500 max-w-32 truncate">{record?.location ?? '—'}</td>
                  <td className="px-3 py-2 text-gray-400 text-xs whitespace-nowrap">
                    {record?.submitted_at
                      ? new Date(record.submitted_at).toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                </tr>
              )
            })}
            <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
              <td className="px-3 py-2" colSpan={5}>Celkem</td>
              <td className="px-3 py-2">{totalHours.toFixed(2)}h</td>
              <td className={`px-3 py-2 ${totalOvertime >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {fmtOvertime(totalOvertime)}h
              </td>
              <td className="px-3 py-2" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Karty — mobil */}
      <div className="md:hidden space-y-2">
        {days.map(day => {
          const dateStr = fmt(day)
          const record = recordMap.get(dateStr)
          const isWe = isWeekend(day)

          if (isWe && !record) {
            return (
              <div key={dateStr} className="bg-gray-50 rounded-lg border border-gray-100 px-4 py-2 flex justify-between text-gray-400 text-sm">
                <span>{day.getDate()}. {day.getMonth() + 1}. {CZECH_DAYS[day.getDay()]}</span>
                <span>Víkend</span>
              </div>
            )
          }

          return (
            <div key={dateStr} className={`rounded-lg border px-4 py-3 ${!record && !isWe ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">
                    {day.getDate()}. {day.getMonth() + 1}. <span className="text-gray-400">{CZECH_DAYS[day.getDay()]}</span>
                  </p>
                  {record ? (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {record.time_from} – {record.time_to} · {record.break_minutes} min přestávka
                    </p>
                  ) : (
                    <p className="text-xs text-orange-400 mt-0.5">Nezapsáno</p>
                  )}
                  {record?.location && <p className="text-xs text-gray-400 mt-0.5">{record.location}</p>}
                </div>
                {record && (
                  <div className="text-right">
                    <p className="text-sm font-medium">{Number(record.hours_worked).toFixed(2)}h</p>
                    <p className={`text-xs font-medium ${record.overtime >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {fmtOvertime(record.overtime)}h
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div className="bg-gray-100 rounded-lg border px-4 py-3 flex justify-between font-semibold text-sm">
          <span>Celkem</span>
          <div className="text-right">
            <p>{totalHours.toFixed(2)}h</p>
            <p className={`text-xs ${totalOvertime >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {fmtOvertime(totalOvertime)}h
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
