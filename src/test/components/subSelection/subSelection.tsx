import React, { ComponentPropsWithRef, ReactNode } from 'react';

function ActuallySelectedComponent({ children, className }: { children: ReactNode } & ComponentPropsWithRef<'div'>) {
  return <div className={className}>{children}</div>;
}

function Component() {
  const margin = `m-${Math.floor(Math.random() * 100)}`;
  return (
    <div>
      <span>Child 1</span>
      <span className='child-2'>Child 2</span>
      <ActuallySelectedComponent className={margin} onClick={() => console.log('Hello')}>
        <span>Child 3</span>
        <span className='child-4'>Child 4</span>
      </ActuallySelectedComponent>
    </div>
  );
}
