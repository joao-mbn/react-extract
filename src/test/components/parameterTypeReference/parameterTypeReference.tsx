import React, { ComponentPropsWithoutRef } from 'react';

function Component(props: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={props.className} style={props.style}>
      <div className={props.color}>{props.children}</div>
      <span onClick={props.onClick}></span>
    </div>
  );
}

