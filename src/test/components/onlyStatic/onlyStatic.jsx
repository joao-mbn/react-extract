import React from 'react';
import { CLASS_NAME, VALUE } from './export';

function Component() {
  return (
    <div className='my-class-2'>
      <div className='my-class'>Test</div>
      <span className={'string-literal'}></span>
      <span className={`template literal`}></span>
      <input min={0} max={VALUE} className={CLASS_NAME} />
    </div>
  );
}
