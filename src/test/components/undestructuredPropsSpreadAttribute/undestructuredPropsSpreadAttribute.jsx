import React from 'react';

function Component({ children, ...props }) {
  return (
    <div>
      <div {...props}>{children}</div>
    </div>
  );
}

