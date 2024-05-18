import React from 'react';

function Component() {
  const myClass = 'my-class';

  return <Extracted myClass={myClass} />;
}

const Extracted = ({ myClass }) => (
  <div className={myClass}>
    <div className='my-class'>Test</div>
    <span className={'string-literal'}></span>
  </div>
);

