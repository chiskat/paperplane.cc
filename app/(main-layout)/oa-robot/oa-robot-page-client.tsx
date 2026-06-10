'use client'

import { useState } from 'react'

import SendMessageForm from './_form/send-message-form'
import OARobotList, { type OARobotListSelectedProfile } from './_list/profile-list'

export default function OARobotPageClient() {
  const [selectedProfile, setSelectedProfile] = useState<OARobotListSelectedProfile | null>(null)

  return (
    <section className="pb-10">
      <div className="grid gap-10 md:grid-cols-[22rem_minmax(0,1fr)]">
        <OARobotList onSelectedProfileChange={setSelectedProfile} />
        <SendMessageForm selectedProfile={selectedProfile} />
      </div>
    </section>
  )
}
