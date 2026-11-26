import React, { useEffect, useState } from 'react';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  History,
  Home,
  Layers,
  LifeBuoy,
  RotateCcw,
  Shield,
  X,
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { PlatformScreenId } from '../types/platform';

export interface PlatformSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  mobileTriggerRef: React.RefObject<HTMLButtonElement | null>;
}

export const PlatformSidebar: React.FC<PlatformSidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  mobileTriggerRef,
}) => {
  const {
    activePlatformScreen,
    setActivePlatformScreen,
    pt,
    resetPlatformDemoData,
    isMutating,
  } = usePlatform();

  const [collapsed, setCollapsed] = useState(false);

  // Close mobile drawer on Escape and return focus to trigger button
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
        requestAnimationFrame(() => {
          mobileTriggerRef.current?.focus();
        });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMobileOpen, onCloseMobile, mobileTriggerRef]);

  const handleCloseWithFocus = () => {
    onCloseMobile();
    requestAnimationFrame(() => {
      mobileTriggerRef.current?.focus();
    });
  };

  const navItems: {
    id: PlatformScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'platform_overview', label: pt.platformNav.overview, icon: Home },
    { id: 'platform_tenants', label: pt.platformNav.tenants, icon: Building2 },
    { id: 'platform_plans', label: pt.platformNav.plans, icon: Layers },
    { id: 'platform_subscriptions', label: pt.platformNav.subscriptions, icon: CreditCard },
    { id: 'platform_support', label: pt.platformNav.support, icon: LifeBuoy },
    { id: 'platform_audit', label: pt.platformNav.audit, icon: History },
  ];

  const renderContent = (compact: boolean, mobile: boolean) => (
    <div className="flex h-full flex-col bg-[#081321] text-slate-100 border-r border-[#1A293D] select-none">
      {/* Brand header */}
      <div
        className={`flex items-center justify-between h-14 px-3.5 border-b border-[#1A293D] shrink-0 ${
          compact ? 'justify-center' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setActivePlatformScreen('platform_overview');
            if (mobile) handleCloseWithFocus();
          }}
          className="nr-focus-ring flex items-center gap-2.5 min-w-0 text-left rounded-lg"
        >
          <div className="w-8 h-8 rounded-lg bg-[#047857] flex items-center justify-center text-white shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          {!compact && (
            <div className="min-w-0">
              <div className="font-display text-sm font-bold tracking-tight text-white truncate">
                {pt.platformNav.brandTitle}
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 truncate">
                {pt.platformNav.brandSubtitle}
              </div>
            </div>
          )}
        </button>

        {mobile && (
          <button
            type="button"
            onClick={handleCloseWithFocus}
            className="nr-focus-ring nr-transition p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#132B42]"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable navigation list */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-2.5 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePlatformScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActivePlatformScreen(item.id);
                if (mobile) onCloseMobile();
              }}
              title={compact ? item.label : undefined}
              className={`nr-focus-ring nr-transition w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-[#047857] text-white'
                  : 'text-slate-300 hover:bg-[#132B42]/75 hover:text-white'
              } ${compact ? 'justify-center px-2' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              />
              {!compact && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer always visible */}
      <div className="p-2.5 border-t border-[#1A293D] space-y-1.5 shrink-0">
        {!compact && (
          <div className="px-2 py-1 text-[10px] text-slate-400 leading-tight">
            {pt.platformNav.demoTag} · {pt.platformNav.contractNote}
          </div>
        )}
        <button
          type="button"
          disabled={isMutating}
          onClick={() => resetPlatformDemoData()}
          title={pt.platformNav.resetDemo}
          className={`nr-focus-ring nr-transition w-full flex items-center justify-center gap-2 rounded-lg border border-[#1E334A] bg-[#0E1E31] px-2.5 py-2 text-xs font-medium text-amber-300 hover:bg-[#132B42] hover:text-amber-200 disabled:opacity-50 ${
            compact ? 'px-2' : ''
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          {!compact && <span className="truncate">{pt.platformNav.resetDemo}</span>}
        </button>

        {!mobile && (
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="nr-focus-ring nr-transition w-full flex items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-[#132B42]"
            title={
              compact
                ? pt.platformNav.expandSidebar
                : pt.platformNav.collapseSidebar
            }
          >
            {compact ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="truncate">{pt.platformNav.collapseSidebar}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          collapsed ? 'w-[68px]' : 'w-[252px]'
        }`}
      >
        <div className="sticky top-0 h-[100dvh]">{renderContent(collapsed, false)}</div>
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={handleCloseWithFocus}
          />
          <aside className="relative z-10 w-[270px] max-w-[85vw] h-[100dvh]">
            {renderContent(false, true)}
          </aside>
        </div>
      )}
    </>
  );
};
