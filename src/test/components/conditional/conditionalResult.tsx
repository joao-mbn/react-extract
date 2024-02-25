import React from 'react';

function Component() {
  const variable = Math.random() > 0.5 ? true : null;
  return <Extracted variable={variable} />;
}

interface ExtractedProps {
  variable: true | null;
}

function Extracted({ variable }: ExtractedProps) {
  return (
    <div className='w-full white-space-nowrap overflow-hidden text-overflow-ellipsis'>
      {variable ?? <span className='pl-2'>Test</span>}
      {variable && <span className='pl-2'>Test</span>}
      {variable ? <span className='pl-2'>Test</span> : <span>Test</span>}
      <div>Another Test</div>
    </div>
  );
}
