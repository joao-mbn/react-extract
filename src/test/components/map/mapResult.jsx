import React from "react";

function Child({ model }) {
  return (
    <div>
      {model.map((item, index) => (
        <div key={index}>{item.label}</div>
      ))}
    </div>
  );
}

function Component() {
  const model = [
    { label: "label1", value: "value1" },
    { label: "label2", value: "value2" },
  ];
  return (
    <Extracted
      model={model}
    />
  );
}

function Extracted({ model }) {
  return (
    <>
      <div>
        {model.map((item, index) => (
          <div key={index}>{item.label}</div>
        ))}
      </div>
      <Child model={model} />
    </>
  );
}
