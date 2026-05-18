'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { authClient } from '@/lib/auth-client'
import { Button } from '../ui/button'

export interface LoginButtonProps extends React.ComponentProps<typeof Button> {
  loginSuccess?(): void | Promise<void>
}

export default function LoginButton(props: LoginButtonProps) {
  const { loginSuccess, children, ...restProps } = props
  const pathname = usePathname()

  const [loading, setLoading] = useState(false)

  return (
    <Button
      {...restProps}
      disabled={loading}
      onClick={() => {
        setLoading(true)
        authClient.signIn
          .oauth2({ providerId: 'gitea', callbackURL: pathname })
          .then(async () => {
            if (loginSuccess) {
              await loginSuccess()
              setLoading(false)
            }
          })
          .catch(() => {
            setLoading(false)
          })
      }}
    >
      {children ?? '通过 Gitea 登录'}
    </Button>
  )
}
