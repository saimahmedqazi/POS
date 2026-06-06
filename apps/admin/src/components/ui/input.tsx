import {
  forwardRef,
} from 'react';

import type {
  InputHTMLAttributes,
} from 'react';

type Props =
  InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<
  HTMLInputElement,
  Props
>(
  (
    {
      className = '',

      ...props
    },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        {...props}
        className={`w-full bg-surface border border-border/50 text-foreground placeholder:text-slate-500 rounded-xl px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner ${className}`}
      />
    );
  },
);

Input.displayName =
  'Input';

export default Input;