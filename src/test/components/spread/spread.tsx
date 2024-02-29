import React, { ComponentPropsWithRef } from 'react';

// interface ComponentProps {
//   style: CSSProperties;
//   children: ReactNode;
//   prop1: string;
//   prop2: string;
//   prop3: string;
//   prop4: string;
// }

function Component({ children, style: { color, ...nestedProps } = {}, ...props }: ComponentPropsWithRef<'div'>) {
  const min = Math.floor(Math.random() * 100);

  return (
    <div className='w-full'>
      <div {...props} style={{ ...nestedProps }}>
        {children}
      </div>
      <input min={min} style={{ color }} />
    </div>
  );
}
