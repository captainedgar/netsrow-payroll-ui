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
  serverLogin?: (email: string, password: string) => Promise<'invalid' | 'unavailable' | null>;
  serverBusy?: boolean;
  serviceUnavailable?: boolean;
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
  serverLogin, serverBusy, serviceUnavailable,
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

    if (serverLogin) {
      if (serverBusy || !validateFields()) return;
      setAuthErrorKind(await serverLogin(email.trim(), password));
      return;
    }

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

  const visibleError = authErrorKind ?? (serviceUnavailable ? 'unavailable' : null);

  const authErrorMessage = (() => {
    switch (visibleError) {
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
      {visibleError && authErrorMessage && (
        <div
          role="alert"
          className={`rounded-xl border p-3 text-xs flex items-start gap-2.5 ${
            visibleError === 'unavailable'
              ? 'border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] text-[var(--nr-warning)]'
              : 'border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] text-[var(--nr-error)]'
          }`}
        >
          {visibleError === 'unavailable' ? (
            <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{authErrorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {pendingToken && authorizedTenants.length > 0 ? (
          <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-4 space-y-3">
            <div className="text-xs font-bold text-[var(--nr-text)]">
              {pt.auth.multiTenantTitle}
            </div>
            <p className="text-xs text-[var(--nr-text-secondary)]">
              {pt.auth.multiTenantSubtitle}
            </p>
            <div className="space-y-2">
              {authorizedTenants.map((ten) => (
                <label
                  key={ten.tenantId}
                  className="nr-transition flex items-center justify-between gap-2 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] p-2.5 text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="chosen-tenant"
                      checked={chosenTenantId === ten.tenantId}
                      onChange={() => setChosenTenantId(ten.tenantId)}
                    />
                    <div>
                      <div className="font-semibold text-[var(--nr-text)]">{ten.tenantName}</div>
                      <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
                        {ten.tenantCode} · RNC {ten.rnc}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--nr-primary)] font-semibold">
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
                className="block text-xs font-semibold text-[var(--nr-text)] mb-1.5"
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
                className="nr-focus-ring nr-transition w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm text-[var(--nr-text)] placeholder:text-[var(--nr-text-secondary)]/70"
              />
              {fieldErrors.emailRequired && (
                <p className="mt-1 text-[11px] font-medium text-[var(--nr-error)]">
                  {pt.auth.errEmailRequired}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={`${portal}-password`}
                  className="block text-xs font-semibold text-[var(--nr-text)]"
                >
                  {pt.auth.passwordLabel}
                </label>
                {onForgotPasswordClick && (
                  <button
                    type="button"
                    onClick={onForgotPasswordClick}
                    className="nr-focus-ring text-[11px] font-medium text-[var(--nr-primary)] hover:underline rounded"
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
                  className="nr-focus-ring nr-transition w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] pl-3 pr-10 text-sm text-[var(--nr-text)] placeholder:text-[var(--nr-text-secondary)]/70"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? pt.auth.hidePassword : pt.auth.showPassword}
                  className="nr-focus-ring nr-transition absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.passwordRequired && (
                <p className="mt-1 text-[11px] font-medium text-[var(--nr-error)]">
                  {pt.auth.errPasswordRequired}
                </p>
              )}
            </div>

            {portal === 'PLATFORM' && (
              <label className="flex items-center gap-2 text-xs text-[var(--nr-text-secondary)] cursor-pointer pt-0.5">
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
          <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--nr-text)]">
              <KeyRound className="w-4 h-4 text-[var(--nr-primary)]" />
              <span>{pt.auth.twoFactorTitle}</span>
            </div>
            <p className="text-xs text-[var(--nr-text-secondary)]">
              {pt.auth.twoFactorDesc}
            </p>
            <div>
              <label
                htmlFor="two-factor-code"
                className="block text-xs font-semibold text-[var(--nr-text)] mb-1"
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
                className="nr-focus-ring nr-transition w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-sm font-mono-num tracking-widest text-[var(--nr-text)]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setTwoFactorStep(false);
                setTwoFactorCode('');
              }}
              className="nr-focus-ring text-xs font-medium text-[var(--nr-text-secondary)] hover:underline rounded"
            >
              {pt.auth.backToLogin}
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={serverLogin ? serverBusy : isMutating}
          className="nr-focus-ring nr-transition w-full h-10 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] disabled:opacity-60 text-sm font-semibold text-[var(--nr-primary-fg)] flex items-center justify-center gap-2"
        >
          {(serverLogin ? serverBusy : isMutating) ? (
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

      {!serverLogin && (
      <div className="rounded-xl border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] p-3.5 space-y-3">
        <div className="flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-[var(--nr-warning)] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-[var(--nr-text)]">
              {pt.auth.demoProfilesTitle}
            </div>
            <p className="text-[11px] text-[var(--nr-text-secondary)] mt-0.5">
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
              className="nr-focus-ring nr-transition flex items-center justify-between gap-2 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 py-2 text-left text-xs hover:border-[var(--nr-primary)]"
            >
              <div className="min-w-0">
                <div className="font-semibold text-[var(--nr-text)] truncate">
                  {locale === 'es' ? prof.labelEs : prof.labelEn}
                </div>
                <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)] truncate">
                  {prof.email}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[var(--nr-primary)] whitespace-nowrap shrink-0">
                {locale === 'es' ? prof.badgeEs : prof.badgeEn}
              </span>
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-[var(--nr-warning-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label
            htmlFor={`${portal}-fault-select`}
            className="text-[11px] font-semibold text-[var(--nr-text)]"
          >
            {pt.auth.faultSimLabel}
          </label>
          <select
            id={`${portal}-fault-select`}
            value={simulatedFault}
            onChange={(e) => setSimulatedFault(e.target.value as SimulatedAuthFault)}
            className="nr-focus-ring h-8 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2 text-xs font-medium text-[var(--nr-text)]"
          >
            <option value="NONE">{pt.auth.faultNone}</option>
            <option value="SERVICE_UNAVAILABLE">{pt.auth.faultUnavailable}</option>
            <option value="SESSION_EXPIRED">{pt.auth.faultExpired}</option>
          </select>
        </div>
      </div>
      )}
    </div>
  );
};
