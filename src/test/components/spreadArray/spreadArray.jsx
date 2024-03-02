import React from 'react';

function Component(props) {
  const {
    items: [item1, item2, ...otherItems]
  } = props;

  return (
    <div className='my-class-2'>
      <div>{item1}</div>
      <div>{item2}</div>
      <div>{otherItems.join(', ')}</div>
    </div>
  );
}

