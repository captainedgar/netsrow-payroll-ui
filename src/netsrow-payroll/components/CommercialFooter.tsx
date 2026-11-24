import React from 'react';
import { useCommercial } from '../context/CommercialContext';

export const CommercialFooter: React.FC = () => {
  const { ct, navigateTo, isTenantAuthenticated } = useCommercial();

  return (
    <footer className="border-t border-[var(--nr-border)] bg-[var(--nr-surface)] py-12 sm:py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-sm">
        <div className="md:col-span-5 space-y-3">
          <div className="font-display text-base font-bold text-[var(--nr-text)]">
            NetsRow ERP
          </div>
          <p className="text-[var(--nr-text-secondary)] max-w-sm leading-relaxed">
            {ct.footer.tagline}
          </p>
          <p className="text-xs text-[var(--nr-text-secondary)]">
            {ct.footer.demoDisclaimer}
          </p>
        </div>

        <div className="md:col-span-3 space-y-3">
          <div className="text-sm font-semibold text-[var(--nr-text)]">
            {ct.footer.productCol}
          </div>
          <ul className="space-y-2 text-[var(--nr-text-secondary)]">
            <li>
              <button
                type="button"
                onClick={() => navigateTo('/#funcionalidades')}
                className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 rounded nr-focus-ring nr-transition"
              >
                {ct.nav.features}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateTo('/planes')}
                className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 rounded nr-focus-ring nr-transition"
              >
                {ct.nav.plans}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateTo('/#paquete-completo')}
                className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 rounded nr-focus-ring nr-transition"
              >
                {ct.nav.posBundle}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateTo('/#faq')}
                className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 rounded nr-focus-ring nr-transition"
              >
                {ct.nav.faq}
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-3">
          <div className="text-sm font-semibold text-[var(--nr-text)]">
            {ct.footer.accessCol}
          </div>
          <ul className="space-y-2 text-[var(--nr-text-secondary)]">
            <li>
              <button
                type="button"
                onClick={() => navigateTo(isTenantAuthenticated ? '/erp' : '/login')}
                className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 rounded nr-focus-ring nr-transition"
              >
                {ct.footer.clientLoginLink}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateTo('/register')}
                className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 rounded nr-focus-ring nr-transition"
              >
                {ct.footer.registerDemoLink}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateTo('/platform/login')}
                className="hover:text-[var(--nr-text)] hover:underline underline-offset-4 rounded nr-focus-ring nr-transition"
              >
                {ct.footer.superadminLink}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
