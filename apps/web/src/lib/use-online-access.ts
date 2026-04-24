import { useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'
import { useAccessStore } from './access-store'

type OnlineAccess = {
  loading: boolean
  needsCode: boolean
  unlocked: boolean
}

export function useOnlineAccess(): OnlineAccess {
  const needsCode = useQuery(api.access.isAccessCodeNeeded)
  const storedCode = useAccessStore((s) => s.code)
  const clearCode = useAccessStore((s) => s.clear)

  const shouldVerify = needsCode === true && storedCode !== null
  const verification = useQuery(
    api.access.verifyAccessCode,
    shouldVerify ? { code: storedCode } : 'skip',
  )

  useEffect(() => {
    if (shouldVerify && verification && verification.ok === false) {
      clearCode()
    }
  }, [shouldVerify, verification, clearCode])

  const loading =
    needsCode === undefined || (shouldVerify && verification === undefined)

  const unlocked =
    needsCode === false || (shouldVerify && verification?.ok === true)

  return { loading, needsCode: needsCode === true, unlocked }
}
