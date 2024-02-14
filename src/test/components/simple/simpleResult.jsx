import React from "react";

function Component() {
  return (
    <Extracted
      className="my-class"
      style={{ color: "red" }}
      onClick={() => console.log("Clicked!")}
      className2="another-class"
    />
  );
}

function Extracted({ className, style, onClick, className2 }) {
  return (
    <div>
      <div className={className} style={style} onClick={onClick}>
        Test
      </div>
      <div className={className2}>Test2</div>
    </div>
  );
}
