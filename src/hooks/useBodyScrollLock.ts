import { useEffect } from 'react'

/** Locks background scroll when modals are open (iOS-safe). */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const scrollY = window.scrollY
    const { style } = document.body
    const prev = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
      touchAction: style.touchAction,
    }

    document.body.classList.add('modal-open')
    style.overflow = 'hidden'
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.width = '100%'
    style.touchAction = 'none'

    return () => {
      document.body.classList.remove('modal-open')
      style.overflow = prev.overflow
      style.position = prev.position
      style.top = prev.top
      style.width = prev.width
      style.touchAction = prev.touchAction
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
