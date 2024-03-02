import React from 'react';

function Child(props) {
  return <div>{props}</div>;
}

function Component({ children, style: { color, ...nestedProps }, ...props }) {
  return <Extracted children={children} color={color} props={props} nestedProps={nestedProps} />;
}

function Extracted({ children, color, props, nestedProps }) {
  return (
    <div className='w-full'>
      <div>{children}</div>
      <Child {...props}></Child>
      <Child {...nestedProps}></Child>
      <input style={{ color }} />
    </div>
  );
}

