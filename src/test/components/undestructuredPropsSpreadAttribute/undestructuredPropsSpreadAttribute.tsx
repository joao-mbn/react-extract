import React, { ComponentPropsWithoutRef } from 'react';

function Component({ children, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div>
      <div {...props}>{children}</div>
    </div>
  );
}

