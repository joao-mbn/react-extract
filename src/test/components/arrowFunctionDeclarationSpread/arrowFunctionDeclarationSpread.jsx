import React from 'react';

function Component({ children, style: { color, ...nestedProps } = {}, ...props }) {
  return (
    <div>
      <div {...props} style={{ ...nestedProps }}>
        {children}
      </div>
      <input style={{ color }} />
    </div>
  );
}

