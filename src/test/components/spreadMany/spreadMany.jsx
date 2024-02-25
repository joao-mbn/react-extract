import React from "react";

function Component({ onClick, ...props }) {
  const min = Math.floor(Math.random() * 100);
  const inputProps = { min, max: 20, onChange: () => {} }
  const spanProps = { children: "Text", className: "bg-red-500" }

  return (
    <div className="w-full">
      <div onClick={onClick} {...props}>Another Test</div>
      <input {...inputProps}/>
      <span {...spanProps}></span>
    </div>
  );
}
