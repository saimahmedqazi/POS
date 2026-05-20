import {
  useState,
} from 'react';



import Card from '../../components/ui/card';

import Input from '../../components/ui/input';

import Button from '../../components/ui/button';

import {
  createLocalUser,
  saveLicense,
} from '../../repositories/local-auth.repository';

import {
  setSetting,
} from '../../repositories/settings.repository';

import {
  getMachineFingerprint,
} from '../../services/machine.service';

import {
  VALID_LICENSES,
} from '../../config/license';

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
    licenseKey,
    setLicenseKey,
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

      const normalizedLicense =
        licenseKey.trim();

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
        !sanitizedPin ||
        !normalizedLicense
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

        // VALIDATE LICENSE
        if (
          !VALID_LICENSES.includes(
            normalizedLicense,
          )
        ) {
          window.alert(
            'Invalid license key',
          );

          return;
        }

        // MACHINE ID
        const machineId =
          await getMachineFingerprint();

        // CREATE OWNER USER
        await createLocalUser(
          {
            name:
              normalizedOwner,

            pin:
              sanitizedPin,
          },
        );

        // SAVE LICENSE
        await saveLicense(
          normalizedLicense,
          normalizedBusiness,
          machineId,
        );

        // SAVE SETTINGS
        await setSetting(
          'business_name',
          normalizedBusiness,
        );

        // GO TO LOGIN
        window.location.reload();
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <Card className="rounded-3xl shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900">
              POS Setup
            </h1>

            <p className="text-slate-500 mt-2">
              Initialize your POS system
            </p>
          </div>

          <div className="space-y-5">
            <Input
              type="text"
              placeholder="Business Name"
              value={
                businessName
              }
              onChange={(e) =>
                setBusinessName(
                  e.target
                    .value,
                )
              }
            />

            <Input
              type="text"
              placeholder="Owner Name"
              value={
                ownerName
              }
              onChange={(e) =>
                setOwnerName(
                  e.target
                    .value,
                )
              }
            />

            <Input
              type="password"
              maxLength={4}
              inputMode="numeric"
              placeholder="4 Digit PIN"
              value={pin}
              onChange={(e) =>
                setPin(
                  e.target
                    .value,
                )
              }
            />

            <Input
              type="text"
              placeholder="License Key"
              value={
                licenseKey
              }
              onChange={(e) =>
                setLicenseKey(
                  e.target
                    .value,
                )
              }
            />

            <Button
              className="w-full"
              disabled={
                loading
              }
              onClick={
                handleSetup
              }
            >
              {loading
                ? 'Initializing...'
                : 'Initialize POS'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}