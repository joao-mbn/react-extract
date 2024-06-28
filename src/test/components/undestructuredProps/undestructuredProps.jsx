import React from 'react';

function Component() {
  const anotherClass = 'my-class';
  const baseClass = 'my-class-2';

  return (
    <div className={baseClass} style={{ color: 'red' }}>
      <div className={anotherClass}>Test</div>
    </div>
  );
}

