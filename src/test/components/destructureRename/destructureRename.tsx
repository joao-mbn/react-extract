import React from 'react';

function Component() {
  const { colour: color } = { colour: 'red' };

  return <div className={color}>Test</div>;
}

