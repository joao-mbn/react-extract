import React, { ComponentPropsWithRef } from 'react';

function Component({ children, style: { color, ...nestedProps } = {}, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div>
      <div {...props} style={{ ...nestedProps }}>
        {children}
      </div>
      <input style={{ color }} />
    </div>
  );
}

