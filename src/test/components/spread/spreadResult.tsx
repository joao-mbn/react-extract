import React, { ComponentPropsWithRef } from "react";

function Component({ ...props }: ComponentPropsWithRef<"div">) {
  const min = Math.floor(Math.random() * 100);

  return (
    <Extracted
      min={min}
      {...props}
    />
  );
}

interface ExtractedProps extends ComponentPropsWithRef<"div"> {
  min: number;
}

function Extracted({ min, ...props }: ExtractedProps) {
  return (
    <div className="w-full">
      <div {...props}>Another Test</div>
      <input min={min} />
    </div>
  );
}
