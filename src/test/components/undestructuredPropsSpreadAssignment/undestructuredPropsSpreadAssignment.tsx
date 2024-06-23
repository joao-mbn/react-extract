import React, { ComponentPropsWithoutRef } from 'react';

function Component({ children, style: { color, ...nestedProps } = {} }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div>
      <div style={{ ...nestedProps }}>{children}</div>
      <input style={{ color: color }} />
    </div>
  );
}

