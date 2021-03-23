import ProfileCard from '../components/ProfileCard'
import { Profile } from '../lib/constants'
import { Subscription, SupabaseRealtimePayload } from '@supabase/supabase-js'
import { supabase } from '../lib/api'
import { useState, useEffect } from 'react'

var realtimeProfiles: Subscription | null

export default function ProfileList() {
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    getPublicProfiles()

    realtimeProfiles = supabase
      .from('profiles')
      .on('*', (payload: SupabaseRealtimePayload<Profile>) => profileUpdated(payload.new))
      .subscribe()

    return () => {
      supabase.removeSubscription(realtimeProfiles)
      realtimeProfiles = null
    }
  }, [])

  function profileUpdated(profile: Profile) {
    const otherProfiles = profiles?.filter((x) => x.id != profile.id)
    setProfiles([profile, ...otherProfiles])
  }

  async function getPublicProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, website, updated_at')
        .order('updated_at', { ascending: false })
      if (error) {
        throw error
      }
      console.log('data', data)
      setProfiles(data)
    } catch (error) {
      console.log('error', error.message)
    }
  }

  return (
    <>
      {profiles?.map((profile) => (
        <ProfileCard profile={profile} key={profile.id} />
      ))}
    </>
  )
}
