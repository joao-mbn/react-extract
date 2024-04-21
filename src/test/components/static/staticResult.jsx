import React from 'react';
import { CLASS_NAME, VALUE } from './export';

const CONSTANT_IN_FILE = 1;

function Component() {
  const baseClass = 'my-class-2';
  return <Extracted baseClass={baseClass} />;
}

function Extracted({ baseClass }) {
  return (
    <div className={baseClass} style={{ color: 'red' }}>
      <div className='my-class' onClick={() => console.log('Clicked!')}>
        Test
      </div>
      <span className={'string-literal'}></span>
      <span className={`template literal`}></span>
      <input min={0} max={VALUE} className={CLASS_NAME + 'text-sm'} />
      <button className={CLASS_NAME + baseClass} />
      <div className='another-class'>Test2</div>
      <div>{CONSTANT_IN_FILE}</div>
    </div>
  );
}

