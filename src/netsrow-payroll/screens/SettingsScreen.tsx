import React, { useEffect, useMemo, useState } from 'react';
import { Building, CheckCircle2, Edit3, Plus, Store, UserCog, X } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { Branch, ErpUser } from '../types/erp';

type SettingsTab = 'business' | 'company' | 'branches' | 'users_roles';

export const SettingsScreen: React.FC = () => {
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
  const [usrModalOpen, setUsrModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<ErpUser | null>(null);
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uRoleId, setURoleId] = useState('');
  const [uBranchId, setUBranchId] = useState('');

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
  };

  const openUserModal = (usr?: ErpUser) => {
    setEditUser(usr ?? null);
    setUName(usr?.fullName ?? '');
    setUEmail(usr?.email ?? '');
    setURoleId(usr?.roleId ?? erpState.roles[0]?.id ?? '');
    setUBranchId(usr?.branchId ?? erpState.branches[0]?.id ?? '');
    setUsrModalOpen(true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName.trim() || !uEmail.trim()) return;
    await upsertErpUser({
      id: editUser?.id ?? `usr-${Date.now()}`,
      fullName: uName.trim(),
      email: uEmail.trim(),
      roleId: uRoleId,
      branchId: uBranchId,
      active: editUser?.active ?? true,
    });
    setUsrModalOpen(false);
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
          <div className="font-semibold text-xs">{b.name}</div>
          <div className="text-[11px] text-slate-500">
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
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
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
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
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
          <div className="font-semibold text-xs">{u.fullName}</div>
          <div className="text-[11px] text-slate-500">{u.email}</div>
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
            label={r ? (locale === 'es' ? r.nameEs : r.nameEn) : u.roleId}
            tone={u.roleId === 'role-admin' ? 'emerald' : 'neutral'}
          />
        );
      },
    },
    {
      key: 'branch',
      header: locale === 'es' ? 'Sucursal' : 'Branch',
      render: (u) => (
        <span className="text-xs">{branchMap.get(u.branchId)?.name ?? '—'}</span>
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
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold"
        >
          <Edit3 className="w-3 h-3" />
          <span>{t.common.edit}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t.navigation.settingsSection}
          </h1>
          <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {locale === 'es'
            ? 'Configura Negocio, Empresa, Sucursales (reflejadas de inmediato en la cabecera) y Usuarios/Roles de demostración.'
            : 'Configure Business, Company, Branches (immediately reflected in header), and Demo Users & Roles.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-800">
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
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Business Settings */}
      {activeTab === 'business' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateBusinessSettings(bizForm);
          }}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 max-w-2xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                {locale === 'es' ? 'Moneda ISO' : 'Currency ISO'}
              </label>
              <input
                value={bizForm.currencyCode}
                onChange={(e) => setBizForm({ ...bizForm, currencyCode: e.target.value })}
                className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {locale === 'es' ? 'Símbolo' : 'Symbol'}
              </label>
              <input
                value={bizForm.currencySymbol}
                onChange={(e) => setBizForm({ ...bizForm, currencySymbol: e.target.value })}
                className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">ITBIS (%)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={bizForm.standardItbisRate}
                onChange={(e) =>
                  setBizForm({ ...bizForm, standardItbisRate: Number(e.target.value) || 0 })
                }
                className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono-num"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
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
              className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
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
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.common.save}</span>
          </button>
        </form>
      )}

      {/* Company Profile */}
      {activeTab === 'company' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateCompanyProfile(compForm);
          }}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 max-w-2xl"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Building className="w-4 h-4" />
            <span>
              {locale === 'es'
                ? 'Al guardar, el nombre y RNC se actualizan de inmediato en el menú lateral y la cabecera.'
                : 'Saving updates the company name and RNC immediately across sidebar and header.'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                {locale === 'es' ? 'Razón social' : 'Company name'}
              </label>
              <input
                required
                value={compForm.name}
                onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">RNC</label>
              <input
                required
                value={compForm.rnc}
                onChange={(e) => setCompForm({ ...compForm, rnc: e.target.value })}
                className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono-num"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                {locale === 'es' ? 'Código empleador TSS' : 'TSS Employer Code'}
              </label>
              <input
                value={compForm.tssEmployerCode}
                onChange={(e) =>
                  setCompForm({ ...compForm, tssEmployerCode: e.target.value })
                }
                className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {locale === 'es' ? 'Teléfono' : 'Phone'}
              </label>
              <input
                value={compForm.phone}
                onChange={(e) => setCompForm({ ...compForm, phone: e.target.value })}
                className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono-num"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {locale === 'es' ? 'Dirección fiscal' : 'Fiscal address'}
            </label>
            <input
              value={compForm.address}
              onChange={(e) => setCompForm({ ...compForm, address: e.target.value })}
              className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.common.save}</span>
          </button>
        </form>
      )}

      {/* Branches */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-200">
              <Store className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {locale === 'es'
                  ? `Sucursal activa en cabecera: «${activeBranch?.name ?? ''}». Edita su nombre para comprobar el cambio inmediato en la barra superior.`
                  : `Header active branch: "${activeBranch?.name ?? ''}". Rename it to verify live header sync.`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => openBranchModal()}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
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

      {/* Users & Roles */}
      {activeTab === 'users_roles' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-sm font-bold flex items-center gap-2">
              <UserCog className="w-4 h-4 text-emerald-600" />
              <span>{locale === 'es' ? 'Usuarios de demostración' : 'Demo users'}</span>
            </h2>
            <button
              type="button"
              onClick={() => openUserModal()}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'Nuevo usuario' : 'New user'}</span>
            </button>
          </div>

          <DataTable
            columns={userCols}
            rows={erpState.users}
            getRowKey={(u) => u.id}
            emptyMessage={t.common.noResults}
          />

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold">
                {locale === 'es'
                  ? 'Matriz de Roles y Alcance ERP (Contrato API vs Solo demo)'
                  : 'Role Matrix & ERP Integration Boundary'}
              </h3>
              <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {erpState.roles.map((r) => (
                <div
                  key={r.id}
                  className="rounded border border-slate-200 dark:border-slate-800 p-3 space-y-2 text-xs"
                >
                  <div className="font-bold">{locale === 'es' ? r.nameEs : r.nameEn}</div>
                  <p className="text-[11px] text-slate-500">
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
                          className="cursor-pointer"
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
          </div>
        </div>
      )}

      {/* Branch Modal */}
      {brModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {editBranch
                  ? locale === 'es'
                    ? 'Editar sucursal'
                    : 'Edit branch'
                  : locale === 'es'
                    ? 'Nueva sucursal'
                    : 'New branch'}
              </h2>
              <button type="button" onClick={() => setBrModalOpen(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveBranch} className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t.common.code}</label>
                  <input
                    required
                    value={brCode}
                    onChange={(e) => setBrCode(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Nombre de sucursal' : 'Branch name'}
                  </label>
                  <input
                    required
                    value={brName}
                    onChange={(e) => setBrName(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Ciudad' : 'City'}
                  </label>
                  <input
                    value={brCity}
                    onChange={(e) => setBrCity(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Teléfono' : 'Phone'}
                  </label>
                  <input
                    value={brPhone}
                    onChange={(e) => setBrPhone(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Dirección' : 'Address'}
                </label>
                <input
                  value={brAddress}
                  onChange={(e) => setBrAddress(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBrModalOpen(false)}
                  className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded bg-emerald-600 text-xs font-semibold text-white"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {usrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {editUser
                  ? locale === 'es'
                    ? 'Editar usuario (Solo demo)'
                    : 'Edit user (Demo only)'
                  : locale === 'es'
                    ? 'Nuevo usuario (Solo demo)'
                    : 'New user (Demo only)'}
              </h2>
              <button type="button" onClick={() => setUsrModalOpen(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveUser} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Nombre completo' : 'Full name'}
                </label>
                <input
                  required
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Rol' : 'Role'}
                  </label>
                  <select
                    value={uRoleId}
                    onChange={(e) => setURoleId(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs"
                  >
                    {erpState.roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {locale === 'es' ? r.nameEs : r.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Sucursal' : 'Branch'}
                  </label>
                  <select
                    value={uBranchId}
                    onChange={(e) => setUBranchId(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs"
                  >
                    {erpState.branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setUsrModalOpen(false)}
                  className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded bg-emerald-600 text-xs font-semibold text-white"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
