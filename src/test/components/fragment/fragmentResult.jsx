import React from "react";

function Component() {
  return (
    <Extracted />
  );
}

function Extracted() {
  return (
    <>
      <div className="text-sm"></div>
      <button disabled />
      <>
        <div>Test</div>
        <div>Test</div>
      </>
    </>
  );
}
