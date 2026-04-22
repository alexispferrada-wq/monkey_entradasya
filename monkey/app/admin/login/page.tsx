import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_10%_10%,rgba(245,158,11,0.18),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(249,115,22,0.18),transparent_45%)]">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.35)]">
            <img src="/monkey-logo.png" alt="Monkey" className="h-10 w-10 object-contain" />
          </div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-amber-300/90 font-bold mb-2">Proyecto Monkey</p>
          <h1 className="text-2xl font-black text-white">Monkey Admin</h1>
          <p className="text-slate-500 text-sm mt-1">monkey.entradasya.cl · local 3001</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
