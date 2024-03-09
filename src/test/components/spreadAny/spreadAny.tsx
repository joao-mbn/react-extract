import React from 'react';

function Component({ children, ...props }: any) {
  return (
    <div {...props}>
      <div>{children}</div>
    </div>
  );
}

