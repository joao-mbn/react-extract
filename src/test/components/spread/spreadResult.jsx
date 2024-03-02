import React from 'react';

function Component({ ...props }) {
  return <Extracted {...props} />;
}

function Extracted({ ...props }) {
  return <div {...props}></div>;
}
