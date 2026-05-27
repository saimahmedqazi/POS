import {
  useState,
} from 'react';


import Card from '../../components/ui/card';

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <Card className="rounded-3xl shadow-xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900">
              Activate POS
            </h1>

            <p className="text-slate-600 mt-4 text-lg">
              Enter your license key to activate the software.
            </p>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {
                  errorMessage
                }
              </div>
            )}

            {successMessage && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
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
                className="w-full rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-6">
              <Button
                className="w-full py-4"
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

            <div className="mt-8 text-sm text-slate-500">
              Internet connection required for first activation
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}