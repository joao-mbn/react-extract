import React from 'react';

function Component({ children, ...props }) {
  return <Extracted children={children} {...props} />;
}

function Extracted({ children, ...props }) {
  return (
    <div>
      <div {...props}>{children}</div>
    </div>
  );
}

