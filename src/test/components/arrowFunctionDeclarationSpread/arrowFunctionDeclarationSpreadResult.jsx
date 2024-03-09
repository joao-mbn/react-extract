import React from 'react';

function Component({ children, style: { color, ...nestedProps } = {}, ...props }) {
  return <Extracted children={children} color={color} nestedProps={nestedProps} {...props} />;
}

const Extracted = ({ children, color, nestedProps, ...props }) => (
  <div>
    <div {...props} style={{ ...nestedProps }}>
      {children}
    </div>
    <input style={{ color }} />
  </div>
);

