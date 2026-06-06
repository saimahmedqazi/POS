import { useEffect, useState } from 'react';

import AdminLayout from '../../layouts/admin-layout';
import Card from '../../components/ui/card';
import Button from '../../components/ui/button';
import PageHeader from '../../components/ui/page-header';

import { supabaseAdmin } from '../../services/supabase-admin.service';

type License = {
  id: string;
  license_key: string;
  business_name?: string;
  machine_id?: string;
  status: string;
  active: boolean;
  expires_at?: string;
  activated_at?: string;
  created_at: string;
};

type ActionType =
  | 'extend'
  | 'reset'
  | 'suspend'
  | 'copy';

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [actionLoading, setActionLoading] = useState<
    Record<string, ActionType | null>
  >({});

  const [expiryDates, setExpiryDates] = useState<
    Record<string, string>
  >({});

  const [feedback, setFeedback] = useState<
    Record<string, string>
  >({});

  function setLoadingState(id: string, action: ActionType | null) {
    setActionLoading((prev) => ({
      ...prev,
      [id]: action,
    }));
  }

  function setMessage(id: string, msg: string) {
    setFeedback((prev) => ({
      ...prev,
      [id]: msg,
    }));

    setTimeout(() => {
      setFeedback((prev) => ({
        ...prev,
        [id]: '',
      }));
    }, 2000);
  }


  function isExpired(license: License) {
    if (!license.expires_at) return false;
    return new Date(license.expires_at).getTime() < Date.now();
  }

  function getSafeBaseDate(license: License) {
    const now = new Date();

    if (!license.expires_at) return now;

    const expiry = new Date(license.expires_at);

    return expiry.getTime() < now.getTime() ? now : expiry;
  }

  async function loadLicenses() {
    try {
      setLoading(true);

      const { data, error } = await supabaseAdmin
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLicenses((data || []) as License[]);
    } catch (err) {
      console.error('LOAD ERROR:', err);
    } finally {
      setLoading(false);
    }
  }

  async function generateLicense() {
    if (generating) return;

    try {
      setGenerating(true);

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const licenseKey = crypto
        .randomUUID()
        .replaceAll('-', '')
        .toUpperCase();

      const { error } = await supabaseAdmin.from('licenses').insert({
        license_key: licenseKey,
        business_name: '',
        machine_id: null,
        status: 'ACTIVE',
        active: true,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      await loadLicenses();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  async function resetMachine(id: string) {
    if (!confirm('Reset machine binding?')) return;
    if (actionLoading[id]) return;

    try {
      setLoadingState(id, 'reset');

      await supabaseAdmin
        .from('licenses')
        .update({
          machine_id: null,
          activated_at: null,
        })
        .eq('id', id);

      setMessage(id, 'Machine reset');

      await loadLicenses();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingState(id, null);
    }
  }

  async function suspendLicense(id: string, active: boolean) {
    if (
      !confirm(
        active
          ? 'Suspend this license?'
          : 'Activate this license?',
      )
    )
      return;

    if (actionLoading[id]) return;

    try {
      setLoadingState(id, 'suspend');

      await supabaseAdmin
        .from('licenses')
        .update({
          active: !active,
          status: active ? 'SUSPENDED' : 'ACTIVE',
        })
        .eq('id', id);

      setMessage(id, active ? 'Suspended' : 'Activated');

      await loadLicenses();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingState(id, null);
    }
  }

  async function updateExactExpiry(id: string, dateStr: string) {
    if (actionLoading[id]) return;

    try {
      setLoadingState(id, 'extend');

      const { error } = await supabaseAdmin
        .from('licenses')
        .update({
          expires_at: new Date(dateStr).toISOString(),
          active: true,
          status: 'ACTIVE',
        })
        .eq('id', id);

      if (error) throw error;

      setMessage(id, `Expiry Updated`);

      await loadLicenses();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingState(id, null);
    }
  }

  async function copyKey(id: string, key: string) {
    if (actionLoading[id]) return;

    try {
      setLoadingState(id, 'copy');

      await navigator.clipboard.writeText(key);

      setMessage(id, 'Copied');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingState(id, null);
    }
  }

  useEffect(() => {
    loadLicenses();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading licenses...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Licenses"
            subtitle="POS subscription management"
          />

          <Button disabled={generating} onClick={generateLicense}>
            {generating ? 'Generating...' : 'Generate License'}
          </Button>
        </div>

        <div className="grid gap-4">
          {licenses.map((license) => {
            const expired = isExpired(license);
            const loadingAction = actionLoading[license.id];

            return (
              <Card key={license.id} className="p-5">
                <div className="flex justify-between gap-6">
                  <div className="space-y-2">
                    <div className="text-lg font-bold break-all">
                      {license.license_key}
                    </div>

                    <div className="text-sm text-slate-500">
                      {license.business_name || 'Not Assigned'}
                    </div>

                    {/* STATUS */}
                    <div>
                      {expired ? (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
                          EXPIRED
                        </span>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            license.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {license.status}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-slate-500">
                      Expiry:{' '}
                      {license.expires_at
                        ? new Date(
                            license.expires_at,
                          ).toLocaleDateString()
                        : '-'}
                    </div>

                    <div className="text-xs text-blue-600">
                      {feedback[license.id]}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <Button
                      variant="secondary"
                      disabled={!!loadingAction}
                      onClick={() =>
                        copyKey(
                          license.id,
                          license.license_key,
                        )
                      }
                    >
                      {loadingAction === 'copy'
                        ? '...'
                        : 'Copy Key'}
                    </Button>

                    {/* EXPIRY PICKER */}
                    <input
                      type="date"
                      className="border border-border/50 px-3 py-2.5 rounded-xl text-sm bg-surface-hover text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all w-full shadow-inner"
                      value={
                        expiryDates[license.id] !== undefined
                          ? expiryDates[license.id]
                          : license.expires_at
                          ? new Date(license.expires_at).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setExpiryDates((prev) => ({
                          ...prev,
                          [license.id]: e.target.value,
                        }))
                      }
                    />

                    <Button
                      disabled={!!loadingAction || !expiryDates[license.id]}
                      onClick={() =>
                        updateExactExpiry(
                          license.id,
                          expiryDates[license.id]
                        )
                      }
                    >
                      {loadingAction === 'extend'
                        ? 'Processing...'
                        : 'Set Expiry'}
                    </Button>

                    <Button
                      variant="secondary"
                      disabled={!!loadingAction}
                      onClick={() =>
                        resetMachine(license.id)
                      }
                    >
                      Reset Machine
                    </Button>

                    <Button
                      variant={
                        license.active ? 'danger' : 'secondary'
                      }
                      disabled={!!loadingAction}
                      onClick={() =>
                        suspendLicense(
                          license.id,
                          license.active,
                        )
                      }
                    >
                      {loadingAction === 'suspend'
                        ? '...'
                        : license.active
                        ? 'Suspend'
                        : 'Activate'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {licenses.length === 0 && (
            <Card className="p-10 text-center text-slate-500">
              No licenses found
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}