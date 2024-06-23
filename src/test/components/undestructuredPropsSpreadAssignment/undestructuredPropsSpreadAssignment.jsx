import React from 'react';

function Component({ children, style: { color, ...nestedProps } = {} }) {
  return (
    <div>
      <div style={{ ...nestedProps }}>{children}</div>
      <input style={{ color: color }} />
    </div>
  );
}

