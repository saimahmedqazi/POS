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
        className={`w-full border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 ${className}`}
      />
    );
  },
);

Input.displayName =
  'Input';

export default Input;