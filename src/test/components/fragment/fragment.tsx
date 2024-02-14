import React from "react";

function Child({ model }: { model: { label: string; value: string }[] }) {
  return (
    <div>
      {model.map((item, index) => (
        <div key={index}>{item.label}</div>
      ))}
    </div>
  );
}

function Component() {
  return (
    <>
      <Child
        model={[
          { label: "label1", value: "value1" },
          { label: "label2", value: "value2" },
        ]}
      />
      <Child
        model={[
          { label: "label3", value: "value3" },
          { label: "label4", value: "value4" },
        ]}
      />
      <Child
        model={[
          { label: "label5", value: "value5" },
          { label: "label6", value: "value6" },
        ]}
      />
    </>
  );
}
