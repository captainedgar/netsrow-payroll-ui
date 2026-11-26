import React from 'react';

export interface NetsRowLogoProps {
  /**
   * 'full' displays the full NetsRow ERP lockup image.
   * 'mark' displays a compact square badge isolating the green NetsRow icon mark (for collapsed sidebars).
   */
  variant?: 'full' | 'mark';
  /**
   * Controls background framing so the dark navy wordmark stays high-contrast on dark surfaces:
   * - 'light': blends directly into light surfaces
   * - 'dark': always wraps in a crisp white badge
   * - 'auto': blends in light mode and wraps in a crisp white badge in dark mode
   */
  surface?: 'light' | 'dark' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const LOGO_ASSET_SRC = '/assets/aistudio/b04c45f1-2aa3-47c0-a702-27dc114265a4_c177faff.png';

const FULL_HEIGHT_CLASSES: Record<NonNullable<NetsRowLogoProps['size']>, string> = {
  xs: 'h-6',
  sm: 'h-7',
  md: 'h-8 sm:h-9',
  lg: 'h-10 sm:h-11',
};

const MARK_BOX_CLASSES: Record<NonNullable<NetsRowLogoProps['size']>, string> = {
  xs: 'w-7 h-7 rounded-md',
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-9 h-9 rounded-lg',
  lg: 'w-10 h-10 rounded-xl',
};

export const NetsRowLogo: React.FC<NetsRowLogoProps> = ({
  variant = 'full',
  surface = 'auto',
  size = 'md',
  className = '',
}) => {
  if (variant === 'mark') {
    return (
      <span
        className={`inline-flex items-center justify-start overflow-hidden bg-white border border-slate-200/80 shadow-xs shrink-0 ${MARK_BOX_CLASSES[size]} ${className}`}
      >
        <img
          src={LOGO_ASSET_SRC}
          alt="NetsRow ERP"
          className="h-[160%] w-auto max-w-none -ml-[12%] pointer-events-none select-none"
        />
      </span>
    );
  }

  const surfaceWrapper =
    surface === 'dark'
      ? 'bg-white rounded-lg px-2 py-0.5 border border-white/15 shadow-xs'
      : surface === 'light'
        ? 'bg-white/95 rounded-lg px-1.5 py-0.5'
        : 'rounded-lg px-1.5 py-0.5 bg-transparent dark:bg-white dark:px-2 dark:border dark:border-white/15';

  return (
    <span
      className={`inline-flex items-center shrink-0 select-none ${surfaceWrapper} ${className}`}
    >
      <img
        src={LOGO_ASSET_SRC}
        alt="NetsRow ERP"
        className={`${FULL_HEIGHT_CLASSES[size]} w-auto object-contain ${
          surface === 'auto' ? 'mix-blend-multiply dark:mix-blend-normal' : ''
        }`}
      />
    </span>
  );
};
