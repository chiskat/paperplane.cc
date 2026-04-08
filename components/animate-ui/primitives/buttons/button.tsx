'use client'

import { motion, type HTMLMotionProps } from 'motion/react'

import { Slot, type WithAsChild } from '@/components/animate-ui/primitives/animate/slot'

type ButtonProps = WithAsChild<
  HTMLMotionProps<'button'> & {
    hoverScale?: number
    tapScale?: number
  }
>

function Button(props: ButtonProps) {
  const { hoverScale = 1.05, tapScale = 0.95 } = props

  if (props.asChild) {
    const { asChild, ...rest } = props
    void asChild
    return <Slot whileTap={{ scale: tapScale }} whileHover={{ scale: hoverScale }} {...rest} />
  }

  const { asChild, ...rest } = props
  void asChild
  return (
    <motion.button whileTap={{ scale: tapScale }} whileHover={{ scale: hoverScale }} {...rest} />
  )
}

export { Button, type ButtonProps }
