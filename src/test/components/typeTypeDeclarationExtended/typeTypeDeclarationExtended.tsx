import React, { ComponentPropsWithoutRef } from 'react';

function Component({ children, style: { color, ...nestedProps } = {}, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div>
      <div {...props} style={{ ...nestedProps }}>
        {children}
      </div>
      <input style={{ color }} />
    </div>
  );
}

