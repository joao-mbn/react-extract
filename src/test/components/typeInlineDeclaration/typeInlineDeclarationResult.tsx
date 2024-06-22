import React from 'react';

function Component() {
  const anotherClass: string = 'my-class';
  const baseClass: string = 'my-class-2';

  return <Extracted anotherClass={anotherClass} baseClass={baseClass} />;
}

function Extracted({ anotherClass, baseClass }: { anotherClass: string; baseClass: string }) {
  return (
    <div className={baseClass} style={{ color: 'red' }}>
      <div className={anotherClass}>Test</div>
    </div>
  );
}

