import React, { useEffect, useRef, useState } from 'react';

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (isVisible) return;
    if (typeof window === 'undefined') {
      setIsVisible(true);
      return;
    }

    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const node = containerRef.current;
    if (!node) {
      setIsVisible(true);
      return;
    }

    const revealIfInView = () => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96 && rect.bottom > -24) {
        setIsVisible(true);
        return true;
      }
      return false;
    };

    if (revealIfInView()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -28px 0px',
      }
    );

    observer.observe(node);

    const handleArrivalOrJump = () => {
      window.setTimeout(() => {
        if (revealIfInView()) {
          observer.disconnect();
        }
      }, 140);
    };

    window.addEventListener('netsrow:section-arrive', handleArrivalOrJump);
    window.addEventListener('hashchange', handleArrivalOrJump);

    return () => {
      observer.disconnect();
      window.removeEventListener('netsrow:section-arrive', handleArrivalOrJump);
      window.removeEventListener('hashchange', handleArrivalOrJump);
    };
  }, [isVisible]);

  const hiddenTransformClass =
    direction === 'left'
      ? '-translate-x-3'
      : direction === 'right'
        ? 'translate-x-3'
        : direction === 'none'
          ? ''
          : 'translate-y-4';

  return (
    <div
      ref={containerRef}
      data-scroll-reveal={isVisible ? 'visible' : 'hidden'}
      style={!isVisible && delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : delayMs > 0 && isVisible ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`transition-[opacity,transform] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] ${
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${hiddenTransformClass}`
      } ${className}`}
    >
      {children}
    </div>
  );
};
