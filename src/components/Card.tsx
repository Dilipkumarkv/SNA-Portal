import { ReactNode } from 'react';

export function Card({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <article id={id} className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 ${className}`}>
      {children}
    </article>
  );
}
