import React from 'react';

function Component(props) {
  return (
    <div className={props.prop1} style={props.style}>
      <div className={props.prop2}>{props.children}</div>
      <span className={props.prop4}></span>
    </div>
  );
}

