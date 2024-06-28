import React, { ComponentPropsWithoutRef } from 'react';

function Component({ children, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <Extracted children={children} {...props} />;
}

interface ExtractedProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: React.ReactNode;
}

function Extracted({ children, ...props }: ExtractedProps) {
  return (
    <div>
      <div {...props}>{children}</div>
    </div>
  );
}

