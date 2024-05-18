import React from 'react';

function Component() {
  const myClass: string = 'my-class';

  return <Extracted myClass={myClass} />;
}

interface ExtractedProps {
  myClass: string;
}

const Extracted: React.FC<ExtractedProps> = ({ myClass }) => (
  <div className={myClass}>
    <div className='my-class'>Test</div>
    <span className={'string-literal'}></span>
  </div>
);

