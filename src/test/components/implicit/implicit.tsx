import React from 'react';

function Component() {
  const isDisabled = true;

  return (
    <form>
      <button disabled>Submit</button>
      <button disabled={false}>Do this</button>
      <button disabled={isDisabled}>Do this</button>
      <input disabled placeholder="Type here" />
    </form>
  );
}
