import React from "react";

function Component() {
  return (
    <div>
      <div className="my-class" style={{ color: "red" }} onClick={() => console.log("Clicked!")}>
        Test
      </div>
      <div className="another-class">Test2</div>
    </div>
  );
}
