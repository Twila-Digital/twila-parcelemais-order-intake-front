'use client'

import { useEffect } from 'react'
import { identifyDatadogUser } from '../lib/datadog'

export function useIdentifyDatadogUser() {
  useEffect(() => {
    identifyDatadogUser()
  }, [])
}
