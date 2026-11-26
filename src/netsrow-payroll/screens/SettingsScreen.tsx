import React, { useEffect, useMemo, useState } from 'react';
import { Building, CheckCircle2, Edit3, Plus, Store, UserCog } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import {
  ErpModal,
  ErpPageHeader,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { Branch, ErpUser } from '../types/erp';

type CompanySettingsUpdate = (profile: import('../types/erp').CompanyProfile) => Promise<void>;

type CompanyAccount = {
  id: string;
  email: string;
  fullName: string;
  canManageCompany: boolean;
  canManageCatalog: boolean;
};

type SettingsTab = 'business' | 'company' | 'branches' | 'users_roles';

export const SettingsScreen: React.FC<{ saveCompany?: CompanySettingsUpdate; live?: boolean }> = ({ saveCompany, live }) => {
  const {
    activeScreen,
    setActiveScreen,
    erpState,
    activeBranch,
    locale,
    t,
    updateBusinessSettings,
    updateCompanyProfile,
    upsertBranch,
    setActiveBranchId,
    upsertErpUser,
    updateRoleDefinition,
  } = usePayrollWorkspace();

  const activeTab: SettingsTab = useMemo(() => {
    if (activeScreen === 'company') return 'company';
    if (activeScreen === 'branches') return 'branches';
    if (activeScreen === 'users_roles') return 'users_roles';
    return 'business';
  }, [activeScreen]);

  // Business form state
  const [bizForm, setBizForm] = useState(erpState.business);
  useEffect(() => setBizForm(erpState.business), [erpState.business]);

  // Company form state
  const [compForm, setCompForm] = useState(erpState.company);
  const [companyStatus, setCompanyStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  useEffect(() => setCompForm(erpState.company), [erpState.company]);

  // Branch modal
  const [brModalOpen, setBrModalOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [brCode, setBrCode] = useState('');
  const [brName, setBrName] = useState('');
  const [brCity, setBrCity] = useState('');
  const [brAddress, setBrAddress] = useState('');
  const [brPhone, setBrPhone] = useState('');

  // User modal
  const [isSaving, setIsSaving] = useState(false);
  const [usrModalOpen, setUsrModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<ErpUser | null>(null);
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uRoleId, setURoleId] = useState('');
  const [uBranchId, setUBranchId] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [companyUsers, setCompanyUsers] = useState<CompanyAccount[]>([]);
  const canManageUsers = Boolean(saveCompany);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(false);
  const [userSaveError, setUserSaveError] = useState<'duplicate' | 'invalid' | 'unavailable' | null>(null);

  useEffect(() => {
    if (!live || !canManageUsers || activeTab !== 'users_roles') return;
    const controller = new AbortController();
    setUsersLoading(true);
    setUsersError(false);
    fetch('/api/tenant/users', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('users');
        const users = await response.json() as CompanyAccount[];
        if (!controller.signal.aborted) setCompanyUsers(users);
      })
      .catch(() => { if (!controller.signal.aborted) setUsersError(true); })
      .finally(() => { if (!controller.signal.aborted) setUsersLoading(false); });
    return () => controller.abort();
  }, [live, canManageUsers, activeTab]);

  const liveRoles = {
    ADMIN: locale === 'es' ? 'Administrador de empresa' : 'Company administrator',
    CATALOG: locale === 'es' ? 'Gestión de catálogo' : 'Catalog manager',
    READ_ONLY: locale === 'es' ? 'Solo lectura' : 'Read only',
  };

  const userRows = live ? companyUsers.map((user): ErpUser => ({
    id: user.id,
    email: user.email,
    fullName: user.fullName || user.email,
    roleId: user.canManageCompany ? 'ADMIN' : user.canManageCatalog ? 'CATALOG' : 'READ_ONLY',
    branchId: activeBranch?.id ?? '',
    active: true,
  })) : erpState.users;

  const roleMap = useMemo(
    () => new Map(erpState.roles.map((r) => [r.id, r])),
    [erpState.roles]
  );
  const branchMap = useMemo(
    () => new Map(erpState.branches.map((b) => [b.id, b])),
    [erpState.branches]
  );

  const openBranchModal = (branch?: Branch) => {
    setEditBranch(branch ?? null);
    setBrCode(branch?.code ?? `SUC-0${erpState.branches.length + 1}`);
    setBrName(branch?.name ?? '');
    setBrCity(branch?.city ?? 'Santo Domingo');
    setBrAddress(branch?.address ?? '');
    setBrPhone(branch?.phone ?? '809-555-0100');
    setBrModalOpen(true);
  };

  const saveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brName.trim()) return;
    setIsSaving(true);
    try {
      await upsertBranch({
        id: editBranch?.id ?? `br-${Date.now()}`,
        code: brCode.trim().toUpperCase(),
        name: brName.trim(),
        city: brCity.trim(),
        address: brAddress.trim(),
        phone: brPhone.trim(),
        isMain: editBranch?.isMain ?? false,
        active: editBranch?.active ?? true,
      });
      setBrModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const openUserModal = (usr?: ErpUser) => {
    setEditUser(usr ?? null);
    setUName(usr?.fullName ?? '');
    setUEmail(usr?.email ?? '');
    setURoleId(live ? 'READ_ONLY' : (usr?.roleId ?? erpState.roles[0]?.id ?? ''));
    setUPassword('');
    setUserSaveError(null);
    setUBranchId(usr?.branchId ?? erpState.branches[0]?.id ?? '');
    setUsrModalOpen(true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName.trim() || !uEmail.trim()) return;
    setIsSaving(true);
    try {
      if (live) {
        if (!saveCompany) return;
        setUserSaveError(null);
        const response = await fetch('/api/tenant/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Netsrow-Client': 'web' },
          body: JSON.stringify({ fullName: uName, email: uEmail, role: uRoleId, password: uPassword }),
        });
        if (!response.ok) {
          setUserSaveError(response.status === 409 ? 'duplicate' : response.status === 400 ? 'invalid' : 'unavailable');
          return;
        }
        const user = await response.json() as CompanyAccount;
        setCompanyUsers((current) => [...current, user]);
        setUPassword('');
        setUsrModalOpen(false);
        return;
      }
      await upsertErpUser({
        id: editUser?.id ?? `usr-${Date.now()}`,
        fullName: uName.trim(),
        email: uEmail.trim(),
        roleId: uRoleId,
        branchId: uBranchId,
        active: editUser?.active ?? true,
      });
      setUsrModalOpen(false);
    } catch (error) {
      if (!live) throw error;
      setUserSaveError('unavailable');
    } finally {
      setIsSaving(false);
    }
  };

  const branchCols: DataTableColumn<Branch>[] = [
    {
      key: 'code',
      header: t.common.code,
      render: (b) => <span className="font-mono-num text-xs font-bold">{b.code}</span>,
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Nombre de sucursal' : 'Branch name',
      minWidthClass: 'min-w-[200px]',
      render: (b) => (
        <div>
          <div className="font-semibold text-xs text-[var(--nr-text)]">{b.name}</div>
          <div className="text-[11px] text-[var(--nr-text-secondary)]">
            {b.city} · {b.address}
          </div>
        </div>
      ),
    },
    {
      key: 'header',
      header: locale === 'es' ? 'Cabecera activa' : 'Active in header',
      render: (b) =>
        activeBranch?.id === b.id ? (
          <StatusBadge
            label={locale === 'es' ? 'Activa en cabecera' : 'Active in header'}
            tone="emerald"
            icon="approved"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActiveBranchId(b.id)}
            className="nr-focus-ring text-xs font-semibold text-[var(--nr-primary)] hover:underline"
          >
            {locale === 'es' ? 'Activar en cabecera' : 'Set active'}
          </button>
        ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (b) => (
        <button
          type="button"
          onClick={() => openBranchModal(b)}
          className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--nr-text)] hover:border-[var(--nr-primary)] hover:bg-[var(--nr-surface-muted)]"
        >
          <Edit3 className="w-3 h-3" />
          <span>{locale === 'es' ? 'Renombrar / Editar' : 'Rename / Edit'}</span>
        </button>
      ),
    },
  ];

  const userCols: DataTableColumn<ErpUser>[] = [
    {
      key: 'name',
      header: locale === 'es' ? 'Usuario' : 'User',
      minWidthClass: 'min-w-[180px]',
      render: (u) => (
        <div>
          <div className="font-semibold text-xs text-[var(--nr-text)]">{u.fullName}</div>
          <div className="text-[11px] text-[var(--nr-text-secondary)]">{u.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: locale === 'es' ? 'Rol asignado' : 'Role',
      render: (u) => {
        const r = roleMap.get(u.roleId);
        return (
          <StatusBadge
            label={live ? liveRoles[u.roleId as keyof typeof liveRoles] : r ? (locale === 'es' ? r.nameEs : r.nameEn) : u.roleId}
            tone={u.roleId === 'role-admin' || u.roleId === 'ADMIN' ? 'emerald' : 'neutral'}
          />
        );
      },
    },
    {
      key: 'branch',
      header: locale === 'es' ? 'Sucursal' : 'Branch',
      render: (u) => (
        <span className="text-xs text-[var(--nr-text)]">
          {branchMap.get(u.branchId)?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (u) => (
        <button
          type="button"
          onClick={() => openUserModal(u)}
          className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--nr-text)] hover:border-[var(--nr-primary)] hover:bg-[var(--nr-surface-muted)]"
        >
          <Edit3 className="w-3 h-3" />
          <span>{t.common.edit}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ErpPageHeader
        title={t.navigation.settingsSection}
        subtitle={
          locale === 'es'
            ? 'Configura Negocio, Empresa, Sucursales y Usuarios y Roles.'
            : 'Configure Business, Company, Branches, and Users & Roles.'
        }
        badge={!live && <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
      />

      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--nr-border)]">
        {(
          [
            { id: 'business', label: t.navigation.business },
            { id: 'company', label: t.navigation.company },
            { id: 'branches', label: t.navigation.branches },
            { id: 'users_roles', label: t.navigation.usersRoles },
          ] as { id: SettingsTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveScreen(tab.id)}
            className={`nr-focus-ring nr-transition px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[var(--nr-primary)] text-[var(--nr-primary)]'
                : 'border-transparent text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'business' && (
        <ErpSurfaceCard padding="lg" className="max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateBusinessSettings(bizForm);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                  {locale === 'es' ? 'Moneda ISO' : 'Currency ISO'}
                </label>
                <input
                  value={bizForm.currencyCode}
                  onChange={(e) => setBizForm({ ...bizForm, currencyCode: e.target.value })}
                  className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm font-mono-num text-[var(--nr-text)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                  {locale === 'es' ? 'Símbolo' : 'Symbol'}
                </label>
                <input
                  value={bizForm.currencySymbol}
                  onChange={(e) => setBizForm({ ...bizForm, currencySymbol: e.target.value })}
                  className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm font-mono-num text-[var(--nr-text)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                  ITBIS (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={bizForm.standardItbisRate}
                  onChange={(e) =>
                    setBizForm({ ...bizForm, standardItbisRate: Number(e.target.value) || 0 })
                  }
                  className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm font-mono-num text-[var(--nr-text)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es'
                  ? 'Pie de comprobante interno no fiscal'
                  : 'Non-fiscal receipt footer'}
              </label>
              <input
                value={locale === 'es' ? bizForm.receiptFooterEs : bizForm.receiptFooterEn}
                onChange={(e) =>
                  setBizForm(
                    locale === 'es'
                      ? { ...bizForm, receiptFooterEs: e.target.value }
                      : { ...bizForm, receiptFooterEn: e.target.value }
                  )
                }
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm text-[var(--nr-text)]"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-[var(--nr-text)] cursor-pointer">
              <input
                type="checkbox"
                checked={bizForm.allowNegativeStock}
                onChange={(e) =>
                  setBizForm({ ...bizForm, allowNegativeStock: e.target.checked })
                }
              />
              <span>
                {locale === 'es'
                  ? 'Permitir ventas POS con stock negativo (no recomendado)'
                  : 'Allow POS sales with negative stock'}
              </span>
            </label>

            <button
              type="submit"
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.common.save}</span>
            </button>
          </form>
        </ErpSurfaceCard>
      )}

      {activeTab === 'company' && (
        <ErpSurfaceCard padding="lg" className="max-w-2xl">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!saveCompany) {
                updateCompanyProfile(compForm);
                return;
              }
              if (companyStatus === 'saving') return;
              setCompanyStatus('saving');
              try {
                await saveCompany(compForm);
                setCompanyStatus('saved');
              } catch {
                setCompanyStatus('error');
              }
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--nr-primary)]">
              <Building className="w-4 h-4 shrink-0" />
              <span>
                {locale === 'es'
                  ? 'Al guardar, el nombre y RNC se actualizan de inmediato en el menú lateral y la cabecera.'
                  : 'Saving updates the company name and RNC immediately across sidebar and header.'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company-profile-name" className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                  {locale === 'es' ? 'Razón social' : 'Company name'}
                </label>
                <input
                  id="company-profile-name"
                  required
                  maxLength={120}
                  value={compForm.name}
                  onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                  className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm text-[var(--nr-text)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                  RNC
                </label>
                <input
                  required={!saveCompany}
                  maxLength={24}
                  value={compForm.rnc}
                  onChange={(e) => setCompForm({ ...compForm, rnc: e.target.value })}
                  className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm font-mono-num text-[var(--nr-text)]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                  {locale === 'es' ? 'Código empleador TSS' : 'TSS Employer Code'}
                </label>
                <input
                  maxLength={48}
                  value={compForm.tssEmployerCode}
                  onChange={(e) =>
                    setCompForm({ ...compForm, tssEmployerCode: e.target.value })
                  }
                  className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm font-mono-num text-[var(--nr-text)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                  {locale === 'es' ? 'Teléfono' : 'Phone'}
                </label>
                <input
                  maxLength={32}
                  value={compForm.phone}
                  onChange={(e) => setCompForm({ ...compForm, phone: e.target.value })}
                  className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm font-mono-num text-[var(--nr-text)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Dirección fiscal' : 'Fiscal address'}
              </label>
              <input
                maxLength={240}
                  value={compForm.address}
                onChange={(e) => setCompForm({ ...compForm, address: e.target.value })}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm text-[var(--nr-text)]"
              />
            </div>
            <button
              type="submit"
              disabled={companyStatus === 'saving'}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.common.save}</span>
            </button>
            {companyStatus === 'saved' && <p role="status">{locale === 'es' ? 'Configuración guardada' : 'Settings saved'}</p>}
            {companyStatus === 'error' && <p role="alert">{locale === 'es' ? 'No se pudo guardar la configuración.' : 'Could not save settings.'}</p>}
          </form>
        </ErpSurfaceCard>
      )}

      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] p-3.5 text-xs">
            <div className="flex items-center gap-2 font-semibold text-[var(--nr-success)]">
              <Store className="w-4 h-4 shrink-0" />
              <span>
                {locale === 'es'
                  ? `Sucursal activa en cabecera: «${activeBranch?.name ?? ''}». Edita su nombre para comprobar el cambio inmediato en la barra superior.`
                  : `Header active branch: "${activeBranch?.name ?? ''}". Rename it to verify live header sync.`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => openBranchModal()}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'Nueva sucursal' : 'New branch'}</span>
            </button>
          </div>

          <DataTable
            columns={branchCols}
            rows={erpState.branches}
            getRowKey={(b) => b.id}
            emptyMessage={t.common.noResults}
          />
        </div>
      )}

      {activeTab === 'users_roles' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-sm font-bold text-[var(--nr-text)] flex items-center gap-2">
              <UserCog className="w-4 h-4 text-[var(--nr-primary)]" />
              <span>{locale === 'es' ? 'Usuarios de la empresa' : 'Company users'}</span>
            </h2>
            <button
              type="button"
              onClick={() => openUserModal()}
              disabled={live && (!saveCompany || usersLoading || usersError)}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'Nuevo usuario' : 'New user'}</span>
            </button>
          </div>

          <DataTable
            columns={live ? userCols.filter((column) => column.key !== 'actions') : userCols}
            rows={userRows}
            isLoading={usersLoading}
            getRowKey={(u) => u.id}
            emptyMessage={t.common.noResults}
          />

          {usersError && <p role="alert">{locale === 'es' ? 'No se pudieron cargar los usuarios.' : 'Could not load company users.'}</p>}
          <ErpSurfaceCard padding="md" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-[var(--nr-text)]">
                {locale === 'es'
                  ? 'Matriz de roles y permisos'
                  : 'Role and permission matrix'}
              </h3>
              {!live && <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {live && Object.entries(liveRoles).map(([id, label]) => (
                <div key={id} className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-3.5 space-y-2 text-xs">
                  <div className="font-bold text-[var(--nr-text)]">{label}</div>
                  <p className="text-[var(--nr-text-secondary)]">{locale === 'es'
                    ? ({ ADMIN: 'Configura la empresa y administra usuarios y productos.', CATALOG: 'Consulta y registra productos.', READ_ONLY: 'Consulta el catálogo.' }[id])
                    : ({ ADMIN: 'Manages company settings, users and products.', CATALOG: 'Views and creates products.', READ_ONLY: 'Views the catalog.' }[id])}</p>
                </div>
              ))}
              {!live && erpState.roles.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-3.5 space-y-2 text-xs"
                >
                  <div className="font-bold text-[var(--nr-text)]">
                    {locale === 'es' ? r.nameEs : r.nameEn}
                  </div>
                  <p className="text-[11px] text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? r.descriptionEs : r.descriptionEn}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(
                      [
                        { key: 'canApprovePayroll', label: 'Aprobar nómina' },
                        { key: 'canOperatePosCashbox', label: 'POS / Caja' },
                        { key: 'canPostAccounting', label: 'Contabilidad' },
                        { key: 'canEditSettings', label: 'Configuración' },
                      ] as const
                    ).map((perm) => {
                      const active = r[perm.key];
                      return (
                        <button
                          key={perm.key}
                          type="button"
                          onClick={() =>
                            updateRoleDefinition({ ...r, [perm.key]: !active })
                          }
                          className="nr-focus-ring cursor-pointer rounded-md"
                        >
                          <StatusBadge
                            label={`${perm.label}: ${active ? 'Sí' : 'No'}`}
                            tone={active ? 'emerald' : 'neutral'}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ErpSurfaceCard>
        </div>
      )}

      <ErpModal
        open={brModalOpen}
        onClose={() => setBrModalOpen(false)}
        title={
          editBranch
            ? locale === 'es'
              ? 'Editar sucursal'
              : 'Edit branch'
            : locale === 'es'
              ? 'Nueva sucursal'
              : 'New branch'
        }
        maxWidthClass="max-w-md"
        closeLabel={t.common.close}
        footer={
          <>
            <button
              type="button"
              onClick={() => setBrModalOpen(false)}
              disabled={isSaving}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              form="nr-branch-form"
              disabled={isSaving}
              className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] disabled:opacity-50"
            >
              {t.common.save}
            </button>
          </>
        }
      >
        <form id="nr-branch-form" onSubmit={saveBranch} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {t.common.code}
              </label>
              <input
                required
                value={brCode}
                onChange={(e) => setBrCode(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Nombre de sucursal' : 'Branch name'}
              </label>
              <input
                required
                value={brName}
                onChange={(e) => setBrName(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Ciudad' : 'City'}
              </label>
              <input
                value={brCity}
                onChange={(e) => setBrCity(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Teléfono' : 'Phone'}
              </label>
              <input
                value={brPhone}
                onChange={(e) => setBrPhone(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Dirección' : 'Address'}
            </label>
            <input
              value={brAddress}
              onChange={(e) => setBrAddress(e.target.value)}
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
            />
          </div>
        </form>
      </ErpModal>

      <ErpModal
        open={usrModalOpen}
        onClose={() => setUsrModalOpen(false)}
        title={
          editUser
            ? locale === 'es'
              ? 'Editar usuario (Solo demo)'
              : 'Edit user (Demo only)'
            : locale === 'es'
              ? 'Nuevo usuario'
              : 'New user'
        }
        maxWidthClass="max-w-md"
        closeLabel={t.common.close}
        footer={
          <>
            <button
              type="button"
              onClick={() => setUsrModalOpen(false)}
              disabled={isSaving}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              form="nr-user-form"
              disabled={isSaving}
              className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] disabled:opacity-50"
            >
              {t.common.save}
            </button>
          </>
        }
      >
        <form id="nr-user-form" onSubmit={saveUser} className="space-y-3">
          {userSaveError && <p role="alert" className="text-sm text-[var(--nr-error)]">
            {userSaveError === 'duplicate'
              ? (locale === 'es' ? 'Ese correo no está disponible.' : 'That email is unavailable.')
              : userSaveError === 'invalid'
                ? (locale === 'es' ? 'Verifica el nombre, correo y contraseña.' : 'Check the name, email and password.')
                : (locale === 'es' ? 'No se pudo guardar el usuario.' : 'Could not save the user.')}
          </p>}
          <div>
            <label htmlFor="nr-company-user-name" className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Nombre completo' : 'Full name'}
            </label>
            <input
              required
              maxLength={120}
              id="nr-company-user-name"
              value={uName}
              onChange={(e) => setUName(e.target.value)}
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
            />
          </div>
          <div>
            <label htmlFor="nr-company-user-email" className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              maxLength={254}
              id="nr-company-user-email"
              value={uEmail}
              onChange={(e) => setUEmail(e.target.value)}
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
            />
          </div>
          {live && (
            <label className="grid gap-1 text-xs font-semibold">
              {locale === 'es' ? 'Contraseña inicial' : 'Initial password'}
              <input type="password" autoComplete="new-password" required minLength={12} maxLength={256}
                value={uPassword} onChange={(event) => setUPassword(event.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm" />
            </label>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="nr-company-user-role" className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Rol' : 'Role'}
              </label>
              <select
                id="nr-company-user-role"
              value={uRoleId}
                onChange={(e) => setURoleId(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs text-[var(--nr-text)]"
              >
                {live ? (
                  <>
                    <option value="READ_ONLY">{liveRoles.READ_ONLY}</option>
                    <option value="CATALOG">{liveRoles.CATALOG}</option>
                  </>
                ) : erpState.roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {locale === 'es' ? r.nameEs : r.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Sucursal' : 'Branch'}
              </label>
              <select
                value={uBranchId}
                onChange={(e) => setUBranchId(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs text-[var(--nr-text)]"
              >
                {erpState.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </ErpModal>
    </div>
  );
};
