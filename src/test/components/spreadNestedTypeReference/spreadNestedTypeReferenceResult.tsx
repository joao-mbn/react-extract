import { Property } from 'csstype';
import React, { ComponentPropsWithRef } from 'react';

function Component({ children, style: { color, ...nestedProps } = {}, ...props }: ComponentPropsWithRef<'div'>) {
  return <Extracted children={children} color={color} nestedProps={nestedProps} {...props} />;
}

interface ExtractedProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'style'> {
  children: React.ReactNode;
  color: Property.Color | undefined;
  nestedProps: Omit<React.CSSProperties | undefined, 'color'>;
}

function Extracted({ children, color, nestedProps, ...props }: ExtractedProps) {
  return (
    <div>
      <div {...props} style={{ ...nestedProps }}>
        {children}
      </div>
      <input style={{ color }} />
    </div>
  );
}

