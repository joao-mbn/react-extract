import React from "react";
import { CLASS_NAME, VALUE } from "./export";

function Component() {
  const baseClass = "my-class-2";
  return (
    <Extracted
      className={baseClass}
      style={{ color: "red" }}
      onClick={() => console.log("Clicked!")}
      className2={CLASS_NAME + "text-sm"}
      className3={CLASS_NAME + baseClass}
    />
  );
}

interface ExtractedProps {
  className: string;
  style: { color: "red"; };
  onClick: () => void;
  className2: string;
  className3: string;
}

function Extracted({ className, style, onClick, className2, className3 }: ExtractedProps) {
  return (
    <div className={className} style={style}>
      <div className="my-class" onClick={onClick}>
        Test
      </div>
      <span className={"string-literal"}></span>
      <span className={`template literal`}></span>
      <input min={0} max={VALUE} className={className2} />
      <button className={className3} />
      <div className="another-class">Test2</div>
    </div>
  );
}
