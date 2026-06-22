'use client'

import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export interface UserProfile {
  id: string
  email: string
  user_id: string
  full_name?: string
  role_id?: string
  role_name?: string
  institute_id?: string
  institute_name?: string
  branch_id?: string
  branch_name?: string
}

type ProfileRow = {
  id: string
  full_name?: string
  email?: string
  role_id?: string
  institute_id?: string
  branch_id?: string
  roles?: { name: string }
  institutes?: { name: string }
  branches?: { name: string }
}

type ProfileJoined = ProfileRow

type SupabaseQueryResult<T> = {
  data: T | null
  error: any
}

async function loadUserProfile(email: string): Promise<SupabaseQueryResult<ProfileJoined>> {
  const response = await supabase
    .from('profiles')
    .select('id, full_name, email, role_id, institute_id, branch_id, roles(name), institutes(name), branches(name)')
    .eq('email', email)
    .single()

  return response as SupabaseQueryResult<ProfileJoined>
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileQueryResult, setProfileQueryResult] = useState<SupabaseQueryResult<ProfileJoined> | null>(null)
  const [rawError, setRawError] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          if (!session.user.email) {
            throw new Error('Authenticated user email is missing')
          }

          setSessionUserId(session.user.id)

          const { data, error: profileError } = await loadUserProfile(session.user.email)
          setProfileQueryResult({ data, error: profileError })

          if (profileError) {
            setRawError(profileError)
            throw profileError
          }

          if (data) {
            setProfile({
              id: data.id,
              email: data.email || session.user.email || '',
              user_id: session.user.id,
              full_name: data.full_name,
              role_id: data.role_id,
              role_name: data.roles?.name,
              institute_id: data.institute_id,
              institute_name: data.institutes?.name,
              branch_id: data.branch_id,
              branch_name: data.branches?.name,
            })
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load profile'))
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        if (!session.user.email) {
          throw new Error('Authenticated user email is missing')
        }

        setSessionUserId(session.user.id)

        try {
          const { data, error: profileError } = await loadUserProfile(session.user.email)
          setProfileQueryResult({ data, error: profileError })

          if (profileError) {
            setRawError(profileError)
            throw profileError
          }

          if (data) {
            setProfile({
              id: data.id,
              email: data.email || session.user.email || '',
              user_id: session.user.id,
              full_name: data.full_name,
              role_id: data.role_id,
              role_name: data.roles?.name,
              institute_id: data.institute_id,
              institute_name: data.institutes?.name,
              branch_id: data.branch_id,
              branch_name: data.branches?.name,
            })
          }
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to load profile'))
        }
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  return { user, sessionUserId, profile, profileQueryResult, rawError, loading, error, signOut }
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  return { data, error }
}

export async function signInWithMagicLink(email: string) {
  return supabase.auth.signInWithOtp({
    email,
  })
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email)
}

export async function updateUserProfile(updates: Partial<UserProfile>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No user found')

  return supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single()
}
