import React from 'react';

function Child(props: any) {
  return <div>{props}</div>;
}

interface ComponentProps {
  style: { color: string; nested1: string; nested2: string };
  children: React.ReactNode;
  prop1: string[];
  prop2: string;
  prop3: string;
}

function Component({ children, style: { color, ...nestedProps }, ...props }: ComponentProps) {
  return (
    <div className='w-full'>
      <div>{children}</div>
      <Child {...props}></Child>
      <Child {...nestedProps}></Child>
      <input style={{ color }} />
    </div>
  );
}
