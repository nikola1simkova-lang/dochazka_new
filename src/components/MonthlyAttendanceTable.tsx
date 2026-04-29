'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, AttendanceRecord } from '@/types'
import AttendanceEditModal from './AttendanceEditModal'

type Props = {
  employee: Profile
  records: AttendanceRecord[]
  year: number
  month: number
  employeeId: string
}

type EditDay = {
  date: string
  dateLabel: string
  record: AttendanceRecord | null
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

function dateLabel(day: Date): string {
  return `${day.getDate()}. ${day.getMonth() + 1}.`
}

export default function MonthlyAttendanceTable({ employee, records, year, month, employeeId }: Props) {
  const router = useRouter()
  const [editDay, setEditDay] = useState<EditDay | null>(null)
  const days = getDaysInMonth(year, month)

  const recordMap = new Map<string, AttendanceRecord>()
  records.forEach(r => recordMap.set(r.date, r))

  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }

  const totalHours = records.reduce((s, r) => s + Number(r.hours_worked || 0), 0)
  const totalOvertime = records.reduce((s, r) => s + Number(r.overtime || 0), 0)

  async function handleExport() {
    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    wb.creator = 'ADH-PLOTY Docházkový systém'
    const ws = wb.addWorksheet(`${CZECH_MONTHS[month - 1]} ${year}`)

    ws.columns = [
      { header: 'Datum', key: 'datum', width: 10 },
      { header: 'Den', key: 'den', width: 6 },
      { header: 'Od', key: 'od', width: 8 },
      { header: 'Do', key: 'do_', width: 8 },
      { header: 'Přestávka (min)', key: 'prestav', width: 17 },
      { header: 'Odpracováno (h)', key: 'odprac', width: 17 },
      { header: 'Přesčas (h)', key: 'presac', width: 13 },
      { header: 'Místo práce', key: 'misto', width: 25 },
      { header: 'Čas zápisu', key: 'zapis', width: 20 },
      { header: 'Typ dne', key: 'typ', width: 14 },
    ]

    // Styl hlavičky
    const headerRow = ws.getRow(1)
    headerRow.height = 22
    headerRow.font = { bold: true, size: 12, color: { argb: 'FF1A1A1A' } }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB8CCE4' } }
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
    headerRow.eachCell({ includeEmpty: true }, cell => {
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF4472C4' } },
        left: { style: 'thin' },
        bottom: { style: 'medium', color: { argb: 'FF4472C4' } },
        right: { style: 'thin' },
      }
    })

    // Datové řádky
    days.forEach(day => {
      const dateStr = fmt(day)
      const r = recordMap.get(dateStr)
      const isWe = isWeekend(day)

      const row = ws.addRow({
        datum: dateLabel(day),
        den: CZECH_DAYS[day.getDay()],
        od: r?.time_from?.slice(0, 5) ?? '',
        do_: r?.time_to?.slice(0, 5) ?? '',
        prestav: r !== undefined ? r.break_minutes : '',
        odprac: r ? Number(r.hours_worked).toFixed(2) : '',
        presac: r ? fmtOvertime(r.overtime) : '',
        misto: r?.location ?? '',
        zapis: r?.submitted_at ? new Date(r.submitted_at).toLocaleString('cs-CZ') : '',
        typ: isWe ? 'Víkend' : 'Pracovní den',
      })

      if (isWe) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }
        row.font = { color: { argb: 'FF777777' } }
      } else if (!r) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }
      }

      row.eachCell({ includeEmpty: true }, cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
    })

    // Řádek CELKEM
    const totalRow = ws.addRow({
      datum: 'CELKEM',
      den: '',
      od: '',
      do_: '',
      prestav: '',
      odprac: totalHours.toFixed(2),
      presac: fmtOvertime(totalOvertime),
      misto: employee.name,
      zapis: `${CZECH_MONTHS[month - 1]} ${year}`,
      typ: '',
    })
    totalRow.font = { bold: true, size: 12 }
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB8CCE4' } }
    totalRow.eachCell({ includeEmpty: true }, cell => {
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF4472C4' } },
        left: { style: 'thin' },
        bottom: { style: 'medium', color: { argb: 'FF4472C4' } },
        right: { style: 'thin' },
      }
    })

    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dochazka_${employee.name.replace(/\s+/g, '_')}_${year}_${String(month).padStart(2, '0')}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {editDay && (
        <AttendanceEditModal
          employeeId={employeeId}
          date={editDay.date}
          dateLabel={editDay.dateLabel}
          record={editDay.record}
          onClose={() => setEditDay(null)}
        />
      )}

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
              <th className="px-3 py-2"></th>
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
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{dateLabel(day)}</td>
                  <td className="px-3 py-2">{CZECH_DAYS[day.getDay()]}</td>
                  <td className="px-3 py-2">{record?.time_from?.slice(0, 5) ?? '—'}</td>
                  <td className="px-3 py-2">{record?.time_to?.slice(0, 5) ?? '—'}</td>
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
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setEditDay({ date: dateStr, dateLabel: dateLabel(day), record: record ?? null })}
                      className={`text-xs px-2 py-1 rounded whitespace-nowrap transition-colors ${
                        record
                          ? 'text-blue-600 hover:bg-blue-50'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {record ? 'Upravit' : '+ Přidat'}
                    </button>
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
              <td className="px-3 py-2" colSpan={3}></td>
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
                <span>{dateLabel(day)} {CZECH_DAYS[day.getDay()]}</span>
                <span>Víkend</span>
              </div>
            )
          }

          return (
            <div key={dateStr} className={`rounded-lg border px-4 py-3 ${!record && !isWe ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">
                    {dateLabel(day)} <span className="text-gray-400">{CZECH_DAYS[day.getDay()]}</span>
                  </p>
                  {record ? (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {record.time_from?.slice(0, 5)} – {record.time_to?.slice(0, 5)} · {record.break_minutes} min přestávka
                    </p>
                  ) : (
                    <p className="text-xs text-orange-400 mt-0.5">Nezapsáno</p>
                  )}
                  {record?.location && <p className="text-xs text-gray-400 mt-0.5">{record.location}</p>}
                </div>
                <div className="flex items-center gap-3">
                  {record && (
                    <div className="text-right">
                      <p className="text-sm font-medium">{Number(record.hours_worked).toFixed(2)}h</p>
                      <p className={`text-xs font-medium ${record.overtime >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {fmtOvertime(record.overtime)}h
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setEditDay({ date: dateStr, dateLabel: dateLabel(day), record: record ?? null })}
                    className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                  >
                    {record ? 'Upravit' : '+ Přidat'}
                  </button>
                </div>
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
