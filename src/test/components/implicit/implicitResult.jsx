import React from 'react';

function Component() {
  const isDisabled = Math.random() > 0.5;

  return <Extracted isDisabled={isDisabled} />;
}

function Extracted({ isDisabled }) {
  return (
    <form>
      <button disabled>Submit</button>
      <button disabled={false}>Do this</button>
      <button disabled={isDisabled}>Do this</button>
      <button disabled={undefined}>Do this</button>
      <input disabled placeholder='Type here' />
    </form>
  );
}
