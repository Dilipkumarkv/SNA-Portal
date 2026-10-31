import { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  id,
  as: Tag = 'article',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: 'article' | 'section' | 'div';
}) {
  return (
    <Tag id={id} className={`rounded-card border border-line bg-surface ${className}`}>
      {children}
    </Tag>
  );
}
