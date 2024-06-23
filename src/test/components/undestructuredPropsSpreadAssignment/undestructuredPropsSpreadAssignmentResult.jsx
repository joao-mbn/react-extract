import React from 'react';

function Component({ children, style: { color, ...nestedProps } = {} }) {
  return <Extracted children={children} color={color} nestedProps={nestedProps} />;
}

function Extracted(props) {
  return (
    <div>
      <div style={{ ...props.nestedProps }}>{props.children}</div>
      <input style={{ color: props.color }} />
    </div>
  );
}

