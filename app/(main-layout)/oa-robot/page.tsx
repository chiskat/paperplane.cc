'use client'

import { useState } from 'react'

import SendMessageForm from './_form/SendMessageForm'
import OARobotList, { type OARobotListSelectedProfile } from './_list/List'

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
