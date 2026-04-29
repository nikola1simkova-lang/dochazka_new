'use client'

import { useState } from 'react'

export default function PasswordCell({ password }: { password?: string }) {
  const [show, setShow] = useState(false)

  if (!password) return <span className="text-xs text-gray-300">—</span>

  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      {show ? password : '••••••'}
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="text-gray-400 hover:text-gray-600 underline"
      >
        {show ? 'Skrýt' : 'Zobrazit'}
      </button>
    </span>
  )
}
