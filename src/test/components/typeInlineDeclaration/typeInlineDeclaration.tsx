import React from 'react';

function Component() {
  const anotherClass: string = 'my-class';
  const baseClass: string = 'my-class-2';

  return (
    <div className={baseClass} style={{ color: 'red' }}>
      <div className={anotherClass}>Test</div>
    </div>
  );
}

