// Removed Card import

export default function LicenseExpiredPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-8 md:p-10 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-red-500 tracking-tight">
              License Expired
            </h1>

            <p className="text-slate-300 mt-4 text-lg font-medium">
              Your POS subscription has expired.
            </p>

            <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-sm text-red-300 font-medium leading-relaxed">
              Please contact the software provider
              <br />to renew your license immediately.
            </div>

            <div className="mt-8 text-slate-500 text-sm font-medium tracking-wide uppercase">
              Offline POS Protection Enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}