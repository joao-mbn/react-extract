import React from 'react';

function Component() {
  const anotherClass: string = 'my-class';
  const baseClass: string = 'my-class-2';

  return <Extracted anotherClass={anotherClass} baseClass={baseClass} />;
}

const Extracted: React.FC<{ anotherClass: string; baseClass: string }> = ({ anotherClass, baseClass }) => (
  <div className={baseClass} style={{ color: 'red' }}>
    <div className={anotherClass}>Test</div>
  </div>
);

