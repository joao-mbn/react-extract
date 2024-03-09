import { Property } from 'csstype';
import React, { ComponentPropsWithoutRef } from 'react';

function Component({ children, style: { color, ...nestedProps } = {}, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <Extracted children={children} color={color} nestedProps={nestedProps} {...props} />;
}

interface ExtractedProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'style'> {
  children: React.ReactNode;
  color: Property.Color | undefined;
  nestedProps: Omit<React.CSSProperties, 'color'>;
}

const Extracted = ({ children, color, nestedProps, ...props }: ExtractedProps) => (
  <div>
    <div {...props} style={{ ...nestedProps }}>
      {children}
    </div>
    <input style={{ color }} />
  </div>
);

