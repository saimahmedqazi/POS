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
        className={`w-full border border-border bg-background text-foreground rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground ${className}`}
      />
    );
  },
);

Input.displayName =
  'Input';

export default Input;