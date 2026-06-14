import { useEffect, useState } from 'react';

import AdminLayout from '../../layouts/admin-layout';
import Card from '../../components/ui/card';
import PageHeader from '../../components/ui/page-header';
import Button from '../../components/ui/button';

import { supabase } from '../../services/supabase.service';

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
  const [error, setError] = useState('');

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
        await supabase
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
      setError('Failed to load dashboard stats. Check your Supabase connection.');
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
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-muted-foreground text-sm font-medium">Loading dashboard...</div>
          </div>
        </div>
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
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <Card className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 relative z-10">
              Total Licenses
            </div>
            <div className="text-4xl font-bold mt-3 text-foreground relative z-10">
              {stats.totalLicenses}
            </div>
          </Card>

          <Card className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 border-emerald-500/20 shadow-emerald-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 relative z-10">
              Active
            </div>
            <div className="text-4xl font-bold mt-3 text-emerald-400 relative z-10 drop-shadow-md">
              {stats.activeLicenses}
            </div>
          </Card>

          <Card className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 border-red-500/20 shadow-red-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 relative z-10">
              Expired
            </div>
            <div className="text-4xl font-bold mt-3 text-red-400 relative z-10 drop-shadow-md">
              {stats.expiredLicenses}
            </div>
          </Card>

          <Card className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 border-amber-500/20 shadow-amber-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 relative z-10">
              Suspended
            </div>
            <div className="text-4xl font-bold mt-3 text-amber-400 relative z-10 drop-shadow-md">
              {stats.suspendedLicenses}
            </div>
          </Card>

          {/* HIGH VALUE METRIC */}
          <Card className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 border-orange-500/30 shadow-orange-500/10 ring-1 ring-orange-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-400/80 relative z-10 flex items-center gap-2">
              Expiring (7d)
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            </div>
            <div className="text-4xl font-bold mt-3 text-orange-400 relative z-10 drop-shadow-lg">
              {stats.expiringSoon}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}