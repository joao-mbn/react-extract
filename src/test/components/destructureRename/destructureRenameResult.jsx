import React from 'react';

function Component() {
  const { colour: color } = { colour: 'red' };

  return <Extracted color={color} />;
}

function Extracted({ color }) {
  return <div className={color}>Test</div>;
}

