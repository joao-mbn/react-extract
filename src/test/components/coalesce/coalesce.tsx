import React from "react";

function Component() {
  return (
    <div className="w-full white-space-nowrap overflow-hidden text-overflow-ellipsis">
      {null ?? <span className="pl-2">Test</span>}
      <div>Another Test</div>
    </div>
  );
}
