import 'server-only'
import { NextResponse } from 'next/server'

const NO_STORE = { 'Cache-Control': 'no-store' }

export function unauthorized() {
  return NextResponse.json(
    { status: 401, detail: 'Acesso não verificado.' },
    { status: 401, headers: NO_STORE },
  )
}

export function notFound() {
  return NextResponse.json(
    { status: 404, detail: 'Recurso inexistente.' },
    { status: 404, headers: NO_STORE },
  )
}
