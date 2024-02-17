import React from "react";

function Component({ ...props }) {
  const min = Math.floor(Math.random() * 100);

  return (
    <div className="w-full">
      <div {...props}>Another Test</div>
      <input min={min} />
    </div>
  );
}
