'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  employeeId: string
}

function getTodayDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AttendanceForm({ employeeId }: Props) {
  const [date, setDate] = useState(getTodayDate())
  const [timeFrom, setTimeFrom] = useState('07:00')
  const [timeTo, setTimeTo] = useState('16:00')
  const [breakMinutes, setBreakMinutes] = useState<0 | 30 | 60>(30)
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error } = await supabase.from('attendance_records').insert({
      employee_id: employeeId,
      date,
      time_from: timeFrom,
      time_to: timeTo,
      break_minutes: breakMinutes,
      location: location || null,
    })

    if (error) {
      setError(error.code === '23505' ? 'Na tento den už máš záznam.' : 'Nastala chyba, zkus znovu.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setDate(getTodayDate())
    setTimeFrom('07:00')
    setTimeTo('16:00')
    setBreakMinutes(30)
    setLocation('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Zapsat docházku</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Od</label>
            <input
              type="time"
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do</label>
            <input
              type="time"
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Přestávka</label>
          <div className="flex gap-2">
            {([0, 30, 60] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setBreakMinutes(val)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  breakMinutes === val
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {val === 0 ? 'Žádná' : val === 30 ? '30 min' : '1 hod'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Místo výkonu práce</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="např. Praha, Brno, home office..."
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">✓ Docházka byla zapsána!</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Odesílám...' : 'Odeslat docházku'}
        </button>
      </form>
    </div>
  )
}
