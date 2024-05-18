import React from 'react';

function Component() {
  const myClass = 'my-class';

  return (
    <div className={myClass}>
      <div className='my-class'>Test</div>
      <span className={'string-literal'}></span>
    </div>
  );
}

