import React, { useEffect, useRef, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useCommercial } from '../context/CommercialContext';
import { NetsRowLogo } from './NetsRowLogo';

export const CommercialHeader: React.FC = () => {
  const {
    ct,
    locale,
    setLocale,
    theme,
    toggleTheme,
    navigateTo,
    isTenantAuthenticated,
  } = useCommercial();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const handleLink = (target: string) => {
    setMobileMenuOpen(false);
    navigateTo(target);
  };

  const erpTarget = isTenantAuthenticated ? '/erp' : '/login';

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--nr-border)] bg-[var(--nr-surface)]/95 backdrop-blur-sm nr-transition">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Official NetsRow ERP logo */}
        <button
          type="button"
          onClick={() => handleLink('/')}
          aria-label="NetsRow ERP"
          className="inline-flex items-center shrink-0 rounded-lg nr-focus-ring nr-transition"
        >
          <NetsRowLogo size="sm" surface="auto" />
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary"
          className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium text-[var(--nr-text-secondary)]"
        >
          <button
            type="button"
            onClick={() => handleLink('/#funcionalidades')}
            className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 whitespace-nowrap shrink-0 rounded nr-focus-ring nr-transition"
          >
            {ct.nav.features}
          </button>
          <button
            type="button"
            onClick={() => handleLink('/#facturacion-electronica')}
            className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 whitespace-nowrap shrink-0 rounded nr-focus-ring nr-transition"
          >
            {ct.nav.electronicInvoicing}
          </button>
          <button
            type="button"
            onClick={() => handleLink('/planes')}
            className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 whitespace-nowrap shrink-0 rounded nr-focus-ring nr-transition"
          >
            {ct.nav.plans}
          </button>
          <button
            type="button"
            onClick={() => handleLink('/#paquete-completo')}
            className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 whitespace-nowrap shrink-0 rounded nr-focus-ring nr-transition"
          >
            {ct.nav.posBundle}
          </button>
          <button
            type="button"
            onClick={() => handleLink('/#faq')}
            className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 whitespace-nowrap shrink-0 rounded nr-focus-ring nr-transition"
          >
            {ct.nav.faq}
          </button>
        </nav>

        {/* Zone 3: Language, Theme & Primary ERP Access */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            role="group"
            aria-label="Language"
            className="inline-flex items-center rounded-full border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] p-0.5"
          >
            <button
              type="button"
              onClick={() => setLocale('es')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap nr-focus-ring nr-transition ${
                locale === 'es'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap nr-focus-ring nr-transition ${
                locale === 'en'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Oscuro' : 'Claro'}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] active:scale-95 shrink-0 nr-focus-ring nr-transition"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleLink(erpTarget)}
            className="hidden sm:inline-flex items-center h-10 px-4 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-muted)] active:scale-[0.98] text-sm font-semibold text-[var(--nr-text)] whitespace-nowrap shrink-0 nr-focus-ring nr-transition"
          >
            {ct.nav.erpAccess}
          </button>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label={mobileMenuOpen ? ct.nav.closeMenu : ct.nav.openMenu}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] active:scale-95 shrink-0 nr-focus-ring nr-transition"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--nr-border)] bg-[var(--nr-surface)] px-4 py-4 space-y-1.5 nr-panel-enter">
          <button
            type="button"
            onClick={() => handleLink('/#funcionalidades')}
            className="block w-full text-left px-3 py-2.5 rounded-xl text-[15px] font-medium text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] nr-focus-ring nr-transition"
          >
            {ct.nav.features}
          </button>
          <button
            type="button"
            onClick={() => handleLink('/#facturacion-electronica')}
            className="block w-full text-left px-3 py-2.5 rounded-xl text-[15px] font-medium text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] nr-focus-ring nr-transition"
          >
            {ct.nav.electronicInvoicing}
          </button>
          <button
            type="button"
            onClick={() => handleLink('/planes')}
            className="block w-full text-left px-3 py-2.5 rounded-xl text-[15px] font-medium text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] nr-focus-ring nr-transition"
          >
            {ct.nav.plans}
          </button>
          <button
            type="button"
            onClick={() => handleLink('/#paquete-completo')}
            className="block w-full text-left px-3 py-2.5 rounded-xl text-[15px] font-medium text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] nr-focus-ring nr-transition"
          >
            {ct.nav.posBundle}
          </button>
          <button
            type="button"
            onClick={() => handleLink('/#faq')}
            className="block w-full text-left px-3 py-2.5 rounded-xl text-[15px] font-medium text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] nr-focus-ring nr-transition"
          >
            {ct.nav.faq}
          </button>
          <div className="pt-3 mt-2 border-t border-[var(--nr-border)]">
            <button
              type="button"
              onClick={() => handleLink(erpTarget)}
              className="w-full h-11 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-sm font-semibold text-[var(--nr-primary-fg)] nr-focus-ring nr-transition"
            >
              {ct.nav.erpAccess}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
