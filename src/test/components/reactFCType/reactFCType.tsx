import React from 'react';

function Component() {
  const myClass: string = 'my-class';

  return (
    <div className={myClass}>
      <div className='my-class'>Test</div>
      <span className={'string-literal'}></span>
    </div>
  );
}

