import React, { useState } from 'react';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  ShieldAlert,
  WifiOff,
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { DEMO_LOGIN_PROFILES } from '../data/platformSeed';
import { AuthClientError } from '../services/mockPlatformClient';
import {
  DemoLoginProfile,
  SimulatedAuthFault,
  TenantSummaryRef,
} from '../types/platform';

export interface AuthLoginFormProps {
  portal: 'TENANT' | 'PLATFORM';
  onAuthenticated: () => void;
  onForgotPasswordClick?: () => void;
  initialExpiredNotice?: boolean;
}

type AuthErrorKind =
  | 'invalid'
  | 'expired'
  | 'unavailable'
  | 'forbidden'
  | 'twofactor';

export const AuthLoginForm: React.FC<AuthLoginFormProps> = ({
  portal,
  onAuthenticated,
  onForgotPasswordClick,
  initialExpiredNotice = false,
}) => {
  const {
    pt,
    locale,
    isMutating,
    simulatedFault,
    setSimulatedFault,
    loginWithCredentials,
    selectTenantSession,
  } = usePlatform();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    emailRequired?: boolean;
    passwordRequired?: boolean;
  }>({});
  const [authErrorKind, setAuthErrorKind] = useState<AuthErrorKind | null>(
    initialExpiredNotice ? 'expired' : null
  );

  // Optional simulated 2FA step for /platform/login
  const [requireTwoFactorDemo, setRequireTwoFactorDemo] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Multi-tenant selector step (only when server confirms multiple authorized tenants)
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [authorizedTenants, setAuthorizedTenants] = useState<TenantSummaryRef[]>([]);
  const [chosenTenantId, setChosenTenantId] = useState('');

  const applyDemoProfile = (profile: DemoLoginProfile) => {
    setEmail(profile.email);
    setPassword(profile.demoPasscode);
    setFieldErrors({});
    setAuthErrorKind(null);
    setTwoFactorStep(false);
    setPendingToken(null);
    setAuthorizedTenants([]);
  };

  const validateFields = (): boolean => {
    const errs: { emailRequired?: boolean; passwordRequired?: boolean } = {};
    const emailTrim = email.trim();
    if (!emailTrim || !emailTrim.includes('@') || !emailTrim.includes('.')) {
      errs.emailRequired = true;
    }
    if (!password || password.length < 6) {
      errs.passwordRequired = true;
    }
    setFieldErrors(errs);
    return !errs.emailRequired && !errs.passwordRequired;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorKind(null);

    if (pendingToken && authorizedTenants.length > 0 && chosenTenantId) {
      try {
        await selectTenantSession(pendingToken, chosenTenantId);
        onAuthenticated();
      } catch (err: unknown) {
        handleAuthError(err);
      }
      return;
    }

    if (!twoFactorStep) {
      if (!validateFields()) return;
      if (portal === 'PLATFORM' && requireTwoFactorDemo && simulatedFault === 'NONE') {
        try {
          await loginWithCredentials({
            email: email.trim(),
            password,
            portal,
            twoFactorCode: '246810',
          });
          setTwoFactorStep(true);
          return;
        } catch (err: unknown) {
          handleAuthError(err);
          return;
        }
      }
    }

    try {
      const res = await loginWithCredentials({
        email: email.trim(),
        password,
        portal,
        twoFactorCode: twoFactorStep ? twoFactorCode : undefined,
      });
      if (res.status === 'AUTHENTICATED') {
        onAuthenticated();
      } else if (
        res.status === 'SELECT_TENANT' &&
        res.authorizedTenants &&
        res.authorizedTenants.length > 0 &&
        res.pendingToken
      ) {
        setPendingToken(res.pendingToken);
        setAuthorizedTenants(res.authorizedTenants);
        setChosenTenantId(res.authorizedTenants[0].tenantId);
      }
    } catch (err: unknown) {
      handleAuthError(err);
    }
  };

  const handleAuthError = (err: unknown) => {
    if (err instanceof AuthClientError) {
      if (err.code === 'SERVICE_UNAVAILABLE') {
        setAuthErrorKind('unavailable');
      } else if (err.code === 'SESSION_EXPIRED') {
        setAuthErrorKind('expired');
      } else if (err.code === 'PLATFORM_FORBIDDEN') {
        setAuthErrorKind('forbidden');
      } else if (err.code === 'TWO_FACTOR_INVALID') {
        setAuthErrorKind('twofactor');
      } else {
        setAuthErrorKind('invalid');
      }
      return;
    }
    setAuthErrorKind('unavailable');
  };

  const authErrorMessage = (() => {
    switch (authErrorKind) {
      case 'unavailable':
        return pt.auth.errServiceUnavailable;
      case 'expired':
        return pt.auth.errSessionExpired;
      case 'forbidden':
        return pt.auth.errPlatformForbidden;
      case 'twofactor':
        return pt.auth.errTwoFactorInvalid;
      case 'invalid':
        return pt.auth.errInvalidCredentials;
      default:
        return null;
    }
  })();

  return (
    <div className="space-y-5">
      {/* Error banners */}
      {authErrorKind && authErrorMessage && (
        <div
          role="alert"
          className={`rounded-md border p-3 text-xs flex items-start gap-2.5 ${
            authErrorKind === 'unavailable'
              ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
              : 'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200'
          }`}
        >
          {authErrorKind === 'unavailable' ? (
            <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{authErrorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {pendingToken && authorizedTenants.length > 0 ? (
          <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {pt.auth.multiTenantTitle}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {pt.auth.multiTenantSubtitle}
            </p>
            <div className="space-y-2">
              {authorizedTenants.map((ten) => (
                <label
                  key={ten.tenantId}
                  className="flex items-center justify-between gap-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="chosen-tenant"
                      checked={chosenTenantId === ten.tenantId}
                      onChange={() => setChosenTenantId(ten.tenantId)}
                    />
                    <div>
                      <div className="font-semibold">{ten.tenantName}</div>
                      <div className="font-mono-num text-[11px] text-slate-500">
                        {ten.tenantCode} · RNC {ten.rnc}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    {locale === 'es' ? ten.roleLabelEs : ten.roleLabelEn}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : !twoFactorStep ? (
          <>
            <div>
              <label
                htmlFor={`${portal}-email`}
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                {pt.auth.emailLabel}
              </label>
              <input
                id={`${portal}-email`}
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.emailRequired) {
                    setFieldErrors((p) => ({ ...p, emailRequired: false }));
                  }
                }}
                placeholder={pt.auth.emailPlaceholder}
                aria-invalid={Boolean(fieldErrors.emailRequired)}
                className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-1"
              />
              {fieldErrors.emailRequired && (
                <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                  {pt.auth.errEmailRequired}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={`${portal}-password`}
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  {pt.auth.passwordLabel}
                </label>
                {onForgotPasswordClick && (
                  <button
                    type="button"
                    onClick={onForgotPasswordClick}
                    className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
                  >
                    {pt.auth.forgotPasswordDemo}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id={`${portal}-password`}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.passwordRequired) {
                      setFieldErrors((p) => ({ ...p, passwordRequired: false }));
                    }
                  }}
                  placeholder={pt.auth.passwordPlaceholder}
                  aria-invalid={Boolean(fieldErrors.passwordRequired)}
                  className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-1"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? pt.auth.hidePassword : pt.auth.showPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-emerald-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.passwordRequired && (
                <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                  {pt.auth.errPasswordRequired}
                </p>
              )}
            </div>

            {portal === 'PLATFORM' && (
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={requireTwoFactorDemo}
                  onChange={(e) => setRequireTwoFactorDemo(e.target.checked)}
                />
                <span>{pt.auth.twoFactorToggle}</span>
              </label>
            )}
          </>
        ) : (
          <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>{pt.auth.twoFactorTitle}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {pt.auth.twoFactorDesc}
            </p>
            <div>
              <label
                htmlFor="two-factor-code"
                className="block text-xs font-semibold mb-1"
              >
                {pt.auth.twoFactorCodeLabel}
              </label>
              <input
                id="two-factor-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="246810"
                className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-mono-num tracking-widest focus-visible:outline-2 focus-visible:outline-emerald-600"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setTwoFactorStep(false);
                setTwoFactorCode('');
              }}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:underline"
            >
              {pt.auth.backToLogin}
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isMutating}
          className="w-full h-10 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
        >
          {isMutating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{pt.auth.signingIn}</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>
                {pendingToken
                  ? pt.auth.selectCompanyButton
                  : twoFactorStep
                    ? pt.auth.twoFactorVerifyButton
                    : pt.auth.signInButton}
              </span>
            </>
          )}
        </button>
      </form>

      {/* Isolated Demo Controls (Not included in production builds) */}
      <div className="rounded-md border border-amber-300/80 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 space-y-3">
        <div className="flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
              {pt.auth.demoProfilesTitle}
            </div>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 mt-0.5">
              {pt.auth.demoProfilesSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {DEMO_LOGIN_PROFILES.map((prof) => (
            <button
              key={prof.id}
              type="button"
              onClick={() => applyDemoProfile(prof)}
              className="flex items-center justify-between gap-2 rounded border border-amber-300/70 dark:border-amber-800/70 bg-white dark:bg-slate-900 px-2.5 py-2 text-left text-xs hover:border-emerald-500 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {locale === 'es' ? prof.labelEs : prof.labelEn}
                </div>
                <div className="font-mono-num text-[11px] text-slate-500 truncate">
                  {prof.email}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
                {locale === 'es' ? prof.badgeEs : prof.badgeEn}
              </span>
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label
            htmlFor={`${portal}-fault-select`}
            className="text-[11px] font-semibold text-amber-900 dark:text-amber-200"
          >
            {pt.auth.faultSimLabel}
          </label>
          <select
            id={`${portal}-fault-select`}
            value={simulatedFault}
            onChange={(e) => setSimulatedFault(e.target.value as SimulatedAuthFault)}
            className="h-8 rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="NONE">{pt.auth.faultNone}</option>
            <option value="SERVICE_UNAVAILABLE">{pt.auth.faultUnavailable}</option>
            <option value="SESSION_EXPIRED">{pt.auth.faultExpired}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
