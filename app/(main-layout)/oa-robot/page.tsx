'use client'

import { useState } from 'react'

import OARobotList, { type OARobotListSelectedProfile } from './List'
import SendMessageForm from './SendMessageForm'

export default function OARobotPage() {
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
