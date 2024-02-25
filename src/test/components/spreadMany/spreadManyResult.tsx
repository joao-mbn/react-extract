import React, { ComponentPropsWithRef } from "react";

function Component({ onClick, ...props }: ComponentPropsWithRef<"div">) {
  const min = Math.floor(Math.random() * 100);
  const inputProps: ComponentPropsWithRef<"input"> = { min, max: 20, onChange: () => {} }
  const spanProps = { children: "Text", className: "bg-red-500" }

  return (
    <Extracted
      onClick={onClick}
      props={props}
      inputProps={inputProps}
      spanProps={spanProps}
    />
  );
}

interface ExtractedProps  {
  onClick: ComponentPropsWithRef<"div">;
  props: ComponentPropsWithRef<"div">;
  inputProps: ComponentPropsWithRef<"input">;
  spanProps: { children: string; className: string; };
}

function Extracted({
  onClick,
  props,
  inputProps,
  spanProps
}: ExtractedProps) {
  return (
    <div className="w-full">
      <div onClick={onClick} {...props}>Another Test</div>
      <input {...inputProps}/>
      <span {...spanProps}></span>
    </div>
  );
}
