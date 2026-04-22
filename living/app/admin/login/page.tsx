import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_10%_10%,rgba(220,55,30,0.2),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(246,196,0,0.18),transparent_45%),radial-gradient(circle_at_90%_20%,rgba(76,175,80,0.16),transparent_45%)]">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#dd3b22] via-[#f6c400] to-[#4caf50] flex items-center justify-center shadow-[0_0_35px_rgba(246,196,0,0.35)]">
            <img src="/living-logo.png" alt="Living" className="h-10 w-10 object-contain" />
          </div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-amber-300/90 font-bold mb-2">Proyecto Living Dancehall</p>
          <h1 className="text-2xl font-black text-white">Living Admin</h1>
          <p className="text-slate-500 text-sm mt-1">living.entradasya.cl · local 3002</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
