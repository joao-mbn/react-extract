import React from 'react';

function Component() {
  const anotherClass = 'my-class';
  const baseClass = 'my-class-2';

  return <Extracted anotherClass={anotherClass} baseClass={baseClass} />;
}

function Extracted(props) {
  return (
    <div className={props.baseClass} style={{ color: 'red' }}>
      <div className={props.anotherClass}>Test</div>
    </div>
  );
}
