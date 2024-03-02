import React, { ReactNode } from 'react';

interface ComponentProps {
  style: { color: string; nested1: string; nested2: string };
  children: ReactNode;
  prop1: string[];
  prop2: string;
  prop3: string;
}

function Component({ ...props }: ComponentProps) {
  return <Extracted {...props} />;
}

interface ExtractedProps extends ComponentProps {}

function Extracted({ ...props }: ExtractedProps) {
  return <div {...props}></div>;
}
