import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center glow-primary">
            <svg viewBox="0 0 100 100" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 35 L30 30 Q30 25 35 25 L40 25 M60 25 L65 25 Q70 25 70 30 L70 35 M70 45 L70 55 Q55 50 55 65 Q55 80 70 75 L70 85 Q70 90 65 90 L35 90 Q30 90 30 85 L30 75 Q45 80 45 65 Q45 50 30 55 L30 45"
                stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">monkey.entradasya.cl</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
