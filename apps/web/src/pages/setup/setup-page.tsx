import {
  useState,
} from 'react';

import Input from '../../components/ui/input';

import Button from '../../components/ui/button';

import {
  createLocalUser,
} from '../../repositories/local-auth.repository';

import {
  setSetting,
} from '../../repositories/settings.repository';

export default function SetupPage() {
  const [
    ownerName,
    setOwnerName,
  ] = useState('');

  const [
    businessName,
    setBusinessName,
  ] = useState('');

  const [
    pin,
    setPin,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const handleSetup =
    async () => {
      const normalizedBusiness =
        businessName.trim();

      const normalizedOwner =
        ownerName.trim();

      const sanitizedPin =
        pin
          .trim()
          .replace(
            /\D/g,
            '',
          );

      // REQUIRED FIELDS
      if (
        !normalizedBusiness ||
        !normalizedOwner ||
        !sanitizedPin
      ) {
        window.alert(
          'Please fill all fields',
        );

        return;
      }

      // PIN VALIDATION
      if (
        !/^\d{4}$/.test(
          sanitizedPin,
        )
      ) {
        window.alert(
          'PIN must be exactly 4 digits',
        );

        return;
      }

      try {
        setLoading(true);

        // CREATE OWNER USER
        await createLocalUser(
          {
            name:
              normalizedOwner,

            pin:
              sanitizedPin,
          },
        );

        // SAVE SETTINGS
        await setSetting(
          'business_name',
          normalizedBusiness,
        );

        // RELOAD APP
        // bootstrap will now redirect
        // to /activate-license
        window.location.href =
  '/activate-license';
      } catch (
        error: any
      ) {
        console.error(
          error,
        );

        window.alert(
          error?.message ||
            'Setup failed',
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              POS Setup
            </h1>

            <p className="text-slate-400 mt-2 font-medium">
              Initialize your POS system
            </p>
          </div>

          <div className="space-y-5">
            <Input
              type="text"
              placeholder="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="!bg-black/20 !border-white/10 !text-white !placeholder-slate-500 !py-4 font-medium"
            />

            <Input
              type="text"
              placeholder="Owner Name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="!bg-black/20 !border-white/10 !text-white !placeholder-slate-500 !py-4 font-medium"
            />

            <Input
              type="password"
              maxLength={4}
              inputMode="numeric"
              placeholder="4 Digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="!bg-black/20 !border-white/10 !text-white !placeholder-slate-500 !py-4 text-center text-2xl tracking-[0.5em] font-mono"
            />

            <Button
              className="w-full !py-4 !rounded-2xl !bg-blue-600 hover:!bg-blue-500 !text-white font-bold transition-colors"
              disabled={loading}
              onClick={handleSetup}
            >
              {loading ? 'Initializing...' : 'Initialize POS'}
            </Button>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500 font-medium">
            Powered by CYBSOC
          </div>
        </div>
      </div>
    </div>
  );
}