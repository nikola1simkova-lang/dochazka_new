'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createEmployee(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'Vyplňte všechna pole' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role: 'employee' },
    email_confirm: true,
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      return { error: 'Tento e-mail je již registrován' }
    }
    return { error: 'Chyba při vytváření zaměstnance: ' + error.message }
  }

  revalidatePath('/admin/zamestnanci')
  return { success: true }
}

export async function deleteEmployee(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) return { error: error.message }
  revalidatePath('/admin/zamestnanci')
  return { success: true }
}
