import React from "react";

function Component({ ...props }) {
  const min = Math.floor(Math.random() * 100);

  return (
    <Extracted
      min={min}
      {...props}
    />
  );
}

function Extracted({ min, ...props }) {
  return (
    <div className="w-full">
      <div {...props}>Another Test</div>
      <input min={min} />
    </div>
  );
}
