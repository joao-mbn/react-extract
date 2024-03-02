import React from 'react';

function Component() {
  const { colour: color } = { colour: 'red' };

  return <Extracted color={color} />;
}

interface ExtractedProps {
  color: string;
}

function Extracted({ color }: ExtractedProps) {
  return <div className={color}>Test</div>;
}

