import React from "react";

function Component() {
  return (
    <Extracted
      style={{ color: "red" }}
      onClick={() => console.log("Clicked!")}
    />
  );
}

function Extracted({ style, onClick }) {
  return (
    <div>
      <div className="my-class" style={style} onClick={onClick}>
        Test
      </div>
      <div className="another-class">Test2</div>
    </div>
  );
}
