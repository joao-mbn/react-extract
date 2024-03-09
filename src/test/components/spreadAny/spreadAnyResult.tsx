import React from 'react';

function Component({ children, ...props }: any) {
  return <Extracted children={children} {...props} />;
}

interface ExtractedProps extends Record<any, any> {
  children: any;
}

function Extracted({ children, ...props }: ExtractedProps) {
  return (
    <div {...props}>
      <div>{children}</div>
    </div>
  );
}

