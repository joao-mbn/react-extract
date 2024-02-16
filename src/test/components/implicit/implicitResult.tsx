import React from "react";

function Component() {
  const isDisabled = Math.random() > 0.5;

  return (
    <Extracted
      disabled={isDisabled}
    />
  );
}

interface ExtractedProps {
  disabled: boolean;
}

function Extracted({ disabled }: ExtractedProps) {
  return (
    <form>
      <button disabled>Submit</button>
      <button disabled={false}>Do this</button>
      <button disabled={disabled}>Do this</button>
      <button disabled={undefined}>Do this</button>
      <input disabled placeholder="Type here" />
    </form>
  );
}
