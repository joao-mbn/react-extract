import React from 'react';

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
  const model = [
    { label: 'label1', value: 'value1' },
    { label: 'label2', value: 'value2' }
  ];
  return <Extracted model={model} />;
}

interface ExtractedProps {
  model: { label: string; value: string }[];
}

function Extracted({ model }: ExtractedProps) {
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
