import React from 'react';

function Component() {
  return <Extracted />;
}

function Extracted() {
  return (
    <div className='my-class-2'>
      <div className='my-class'>Test</div>
    </div>
  );
}

