import React from 'react';

function Component() {
  const {
    styles: { color },
    text
  } = { styles: { color: 'red' }, text: 'Test' };

  return <div className={color}>{text}</div>;
}

