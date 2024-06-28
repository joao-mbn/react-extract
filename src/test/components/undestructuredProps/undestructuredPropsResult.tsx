import React from 'react';

function Component() {
  const anotherClass: string = 'my-class';
  const baseClass: string = 'my-class-2';

  return <Extracted anotherClass={anotherClass} baseClass={baseClass} />;
}

interface ExtractedProps {
  anotherClass: string;
  baseClass: string;
}

function Extracted(props: ExtractedProps) {
  return (
    <div className={props.baseClass} style={{ color: 'red' }}>
      <div className={props.anotherClass}>Test</div>
    </div>
  );
}

