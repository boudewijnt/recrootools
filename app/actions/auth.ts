'use server'
// Auth is handled by Clerk. This file is kept for any future server actions.

export async function signup(formData: FormData) {
  throw new Error('signup has been moved to Clerk authentication')
}

export async function login(formData: FormData) {
  throw new Error('login has been moved to Clerk authentication')
}
