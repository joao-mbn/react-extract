import React from "react";

function Component() {
  return (
    <form>
      <button disabled>
        Submit
      </button>
      <button disabled={false}>
        Do this
      </button>
      <button disabled={true}>
        Do this
      </button>
      <input disabled placeholder="Type here" />
    </form>
  );
}
