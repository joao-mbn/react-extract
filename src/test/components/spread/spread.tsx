import React, { ComponentPropsWithRef } from 'react';

function Component({ ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div className="w-full white-space-nowrap overflow-hidden text-overflow-ellipsis">
      {null ?? <span className="pl-2">Test</span>}
      <div {...props}>Another Test</div>
    </div>
  );
}
