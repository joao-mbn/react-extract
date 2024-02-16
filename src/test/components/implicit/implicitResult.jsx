import React from "react";

function Component() {
  const isDisabled = Math.random() > 0.5;

  return (
    <Extracted disabled={isDisabled} />
  );
}

function Extracted({ disabled }) {
  return (
    <form>
      <button disabled>Submit</button>
      <button disabled={false}>Do this</button>
      <button disabled={disabled}>Do this</button>
      <input disabled placeholder="Type here" />
    </form>
  );
}
