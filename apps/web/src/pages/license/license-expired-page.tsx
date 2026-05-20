import Card from '../../components/ui/card';

export default function LicenseExpiredPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <Card className="rounded-3xl shadow-xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600">
              License Expired
            </h1>

            <p className="text-slate-600 mt-4 text-lg">
              Your POS subscription has expired.
            </p>

            <div className="mt-8 bg-slate-100 rounded-2xl p-4 text-sm text-slate-700">
              Please contact the software provider
              to renew your license.
            </div>

            <div className="mt-6 text-slate-500 text-sm">
              Offline POS Protection Enabled
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}