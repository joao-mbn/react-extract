import React from 'react';

function Component() {
  return <Extracted />;
}

const Extracted = () => {
  return (
    <div className='my-class-2'>
      <div className='my-class'>Test</div>
      <span className={'string-literal'}></span>
    </div>
  );
};

