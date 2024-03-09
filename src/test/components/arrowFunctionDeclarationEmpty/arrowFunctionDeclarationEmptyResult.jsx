import React from 'react';

function Component() {
  return <Extracted />;
}

const Extracted = () => (
  <div className='my-class-2'>
    <div className='my-class'>Test</div>
  </div>
);

