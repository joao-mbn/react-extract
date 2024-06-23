import { Property } from 'csstype';
import React, { ComponentPropsWithoutRef } from 'react';

function Component({ children, style: { color, ...nestedProps } = {} }: ComponentPropsWithoutRef<'div'>) {
  return <Extracted children={children} color={color} nestedProps={nestedProps} />;
}

interface ExtractedProps {
  children: React.ReactNode;
  color: Property.Color | undefined;
  nestedProps: Omit<React.CSSProperties, 'color'>;
}

function Extracted(props: ExtractedProps) {
  return (
    <div>
      <div style={{ ...props.nestedProps }}>{props.children}</div>
      <input style={{ color: props.color }} />
    </div>
  );
}

