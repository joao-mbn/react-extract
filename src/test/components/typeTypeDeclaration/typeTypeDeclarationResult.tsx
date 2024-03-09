import React from 'react';

function Component() {
  const anotherClass: string = 'my-class';
  const baseClass: string = 'my-class-2';

  return <Extracted anotherClass={anotherClass} baseClass={baseClass} />;
}

type ExtractedProps = {
  anotherClass: string;
  baseClass: string;
};

function Extracted({ anotherClass, baseClass }: ExtractedProps) {
  return (
    <div className={baseClass} style={{ color: 'red' }}>
      <div className={anotherClass}>Test</div>
    </div>
  );
}

