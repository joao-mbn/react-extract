import React from 'react';

function Component() {
  const {
    styles: { color },
    text
  } = { styles: { color: 'red' }, text: 'Test' };

  return <Extracted color={color} text={text} />;
}

function Extracted({ color, text }) {
  return <div className={color}>{text}</div>;
}

