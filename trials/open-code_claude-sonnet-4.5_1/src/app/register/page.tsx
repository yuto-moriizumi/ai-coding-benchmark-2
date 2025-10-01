import Link from 'next/link'
import { RegisterForm } from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-8">Register</h1>
        
        <RegisterForm />

        <p className="mt-4 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
