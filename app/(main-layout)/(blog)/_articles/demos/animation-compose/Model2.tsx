'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/ui/button'
import { useMounted } from '@/hooks/use-mounted'

function Dialog(props: { show: boolean; onClose: () => void; children: React.ReactNode }) {
  const { show, onClose, children } = props

  const component = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        transition: 'opacity 500ms',
        opacity: show ? 1 : 0,
        visibility: show ? 'visible' : 'hidden',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'white',
          padding: '10px 20px',
          borderRadius: 10,
        }}
      >
        {children}
      </div>
    </div>
  )

  return createPortal(component, document.body)
}

export default function Model2() {
  const [show, setShow] = useState(false)
  const mounted = useMounted()

  if (!mounted) {
    return null
  }

  return (
    <div>
      <Dialog show={show} onClose={() => void setShow(false)}>
        我是模态框内容
      </Dialog>
      <Button size="lg" onClick={() => void setShow(t => !t)}>
        切换
      </Button>
    </div>
  )
}
