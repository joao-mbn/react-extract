import React, { CSSProperties, ReactNode } from 'react';

interface ComponentProps {
  style: CSSProperties;
  children: ReactNode;
  prop1: string;
  prop2: string;
  prop3: string;
  prop4: string;
}

function Component(props: ComponentProps) {
  return (
    <div className={props.prop1} style={props.style}>
      <div className={props.prop2}>{props.children}</div>
      <span className={props.prop4}></span>
    </div>
  );
}

