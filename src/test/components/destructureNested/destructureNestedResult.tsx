import React from 'react';

function Component() {
  const {
    styles: { color },
    text
  } = { styles: { color: 'red' }, text: 'Test' };

  return <Extracted color={color} text={text} />;
}

interface ExtractedProps {
  color: string;
  text: string;
}

function Extracted({ color, text }: ExtractedProps) {
  return <div className={color}>{text}</div>;
}

