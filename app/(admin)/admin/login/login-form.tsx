'use client'

import { useActionState } from 'react'

import { loginAction, type LoginState } from './login-state'

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {
    error: '',
  })

  return <form action={formAction} className="admin-form" noValidate>
    <label>
      <span>E-posta</span>
      <input type="email" name="email" required autoComplete="username"
        aria-invalid={state.error ? true : undefined}/>
    </label>
    <label>
      <span>Şifre</span>
      <input type="password" name="password" required autoComplete="current-password"
        aria-invalid={state.error ? true : undefined}/>
    </label>
    {state.error && <p role="alert" className="admin-form-error">{state.error}</p>}
    <button type="submit" className="button primary" disabled={pending}>
      {pending ? 'Giriş yapılıyor…' : 'Giriş yap'}
    </button>
  </form>
}
