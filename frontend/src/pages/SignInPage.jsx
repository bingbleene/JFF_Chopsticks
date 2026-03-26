import { LoginForm } from '@/components/auth/login-form'
import React from 'react'

const SignInPage = () => {
  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10 z-10">
      <div className="w-full max-w-sm md:max-w-4xl z-10">
        <LoginForm />
      </div>
    </div>
    </div>
  )
}

export default SignInPage