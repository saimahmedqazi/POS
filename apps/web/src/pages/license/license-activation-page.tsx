import {
  useState,
} from 'react';


// Removed Card import

import Button from '../../components/ui/button';

import {
  activateLicense,
} from '../../services/license.service';

export default function LicenseActivationPage() {


  const [
    licenseKey,
    setLicenseKey,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  async function handleActivate() {
    try {
      setLoading(true);

      setErrorMessage(
        '',
      );

      setSuccessMessage(
        '',
      );

      const result =
        await activateLicense(
          licenseKey.trim(),
        );

      setSuccessMessage(
        `Activated successfully for ${result.businessName}`,
      );

      setTimeout(() => {
  window.location.href =
    '/login';
}, 1200);
    } catch (
      error: any
    ) {
      console.error(
        error,
      );

      setErrorMessage(
        error.message ||
          'Activation failed',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-8 md:p-10 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Activate POS
            </h1>

            <p className="text-slate-400 mt-4 text-lg font-medium">
              Enter your license key to activate the software.
            </p>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 text-sm font-medium">
                {
                  errorMessage
                }
              </div>
            )}

            {successMessage && (
              <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-400 text-sm font-medium">
                {
                  successMessage
                }
              </div>
            )}

            <div className="mt-8">
              <input
                type="text"
                placeholder="Enter license key"
                value={
                  licenseKey
                }
                onChange={(e) =>
                  setLicenseKey(
                    e.target
                      .value,
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 text-white placeholder-slate-500 px-4 py-4 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono tracking-widest text-center text-lg"
              />
            </div>

            <div className="mt-6">
              <Button
                className="w-full py-4 !rounded-2xl !bg-blue-600 hover:!bg-blue-500 !text-white font-bold transition-colors text-lg"
                disabled={
                  loading ||
                  !licenseKey.trim()
                }
                onClick={
                  handleActivate
                }
              >
                {loading
                  ? 'Activating...'
                  : 'Activate License'}
              </Button>
            </div>

            <div className="mt-8 text-sm text-slate-500 font-medium">
              Internet connection required for first activation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}