import React from 'react';
import clsx from 'clsx';

interface FlagIconProps {
  code: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FlagIcon: React.FC<FlagIconProps> = ({ code, className, size = 'md' }) => {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  return (
    <span
      className={clsx(
        `fi fi-${code.toLowerCase()}`,
        sizeClass,
        className
      )}
      aria-hidden="true"
    />
  );
};
