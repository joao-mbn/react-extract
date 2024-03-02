import React, { ComponentPropsWithoutRef } from 'react';

function Component(props: ComponentPropsWithoutRef<'div'>) {
  return <Extracted props={props} />;
}

interface ExtractedProps {
  props: ComponentPropsWithoutRef<'div'>;
}

function Extracted({ props }: ExtractedProps) {
  return (
    <div className={props.className} style={props.style}>
      <div className={props.color}>{props.children}</div>
      <span onClick={props.onClick}></span>
    </div>
  );
}

