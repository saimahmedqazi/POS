import { useEffect, useState } from 'react';

import AdminLayout from '../../layouts/admin-layout';
import Card from '../../components/ui/card';
import PageHeader from '../../components/ui/page-header';
import Button from '../../components/ui/button';

import { supabaseAdmin } from '../../services/supabase-admin.service';

type Stats = {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  suspendedLicenses: number;
  expiringSoon: number;
};

type License = {
  active: boolean;
  status: string;
  expires_at?: string | null;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalLicenses: 0,
    activeLicenses: 0,
    expiredLicenses: 0,
    suspendedLicenses: 0,
    expiringSoon: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function safeTime(date?: string | null) {
    if (!date) return null;
    const t = new Date(date).getTime();
    return isNaN(t) ? null : t;
  }

  function computeStats(licenses: License[]) {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    let active = 0;
    let expired = 0;
    let suspended = 0;
    let expiringSoon = 0;

    for (const l of licenses) {
      const expiry = safeTime(l.expires_at);

      const isExpired =
        expiry !== null && expiry < now;

      const isSuspended =
        !l.active || l.status === 'SUSPENDED';

      // EXPIRED takes priority over ACTIVE
      if (isExpired) {
        expired++;
        continue;
      }

      if (isSuspended) {
        suspended++;
        continue;
      }

      // ACTIVE
      active++;

      if (
        expiry &&
        expiry - now <= sevenDays
      ) {
        expiringSoon++;
      }
    }

    return {
      totalLicenses: licenses.length,
      activeLicenses: active,
      expiredLicenses: expired,
      suspendedLicenses: suspended,
      expiringSoon,
    };
  }

  async function loadStats(isRefresh = false) {
    try {
      isRefresh
        ? setRefreshing(true)
        : setLoading(true);

      const { data, error } =
        await supabaseAdmin
          .from('licenses')
          .select('active, status, expires_at');

      if (error) throw error;

      const licenses =
        (data as License[]) || [];

      const computed =
        computeStats(licenses);

      setStats(computed);
    } catch (error) {
      console.error('STATS ERROR:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading dashboard...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Admin Dashboard"
            subtitle="POS SaaS overview"
          />

          <Button
            variant="secondary"
            disabled={refreshing}
            onClick={() => loadStats(true)}
          >
            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
          <Card className="p-6">
            <div className="text-sm text-slate-500">
              Total Licenses
            </div>
            <div className="text-4xl font-bold mt-3">
              {stats.totalLicenses}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-slate-500">
              Active
            </div>
            <div className="text-4xl font-bold mt-3 text-green-600">
              {stats.activeLicenses}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-slate-500">
              Expired
            </div>
            <div className="text-4xl font-bold mt-3 text-red-600">
              {stats.expiredLicenses}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-slate-500">
              Suspended
            </div>
            <div className="text-4xl font-bold mt-3 text-yellow-600">
              {stats.suspendedLicenses}
            </div>
          </Card>

          {/* NEW: HIGH VALUE METRIC */}
          <Card className="p-6">
            <div className="text-sm text-slate-500">
              Expiring (7d)
            </div>
            <div className="text-4xl font-bold mt-3 text-orange-600">
              {stats.expiringSoon}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}