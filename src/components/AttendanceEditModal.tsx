'use client'

import { useState, useTransition } from 'react'
import { upsertAttendanceRecord, deleteAttendanceRecord } from '@/app/admin/dochazka/actions'
import type { AttendanceRecord } from '@/types'

type Props = {
  employeeId: string
  date: string
  dateLabel: string
  record: AttendanceRecord | null
  onClose: () => void
}

export default function AttendanceEditModal({ employeeId, date, dateLabel, record, onClose }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await upsertAttendanceRecord(formData)
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  function handleDelete() {
    if (!record) return
    startTransition(async () => {
      const result = await deleteAttendanceRecord(record.id, employeeId)
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-base">
            {record ? 'Upravit záznam' : 'Přidat záznam'} — {dateLabel}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form action={handleSubmit} className="px-5 py-4 space-y-4">
          <input type="hidden" name="employee_id" value={employeeId} />
          <input type="hidden" name="date" value={date} />

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Od</label>
              <input
                type="time"
                name="time_from"
                defaultValue={record?.time_from?.slice(0, 5) ?? '07:00'}
                required
                className="w-full appearance-none border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Do</label>
              <input
                type="time"
                name="time_to"
                defaultValue={record?.time_to?.slice(0, 5) ?? '16:00'}
                required
                className="w-full appearance-none border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Přestávka</label>
            <select
              name="break_minutes"
              defaultValue={record?.break_minutes ?? 30}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>0 min</option>
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Místo práce</label>
            <input
              type="text"
              name="location"
              defaultValue={record?.location ?? ''}
              placeholder="Volitelné"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            {record && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={isPending}
                className="border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
              >
                Smazat
              </button>
            )}
            {record && confirmDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Mažu…' : 'Potvrdit smazání'}
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Ukládám…' : 'Uložit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
