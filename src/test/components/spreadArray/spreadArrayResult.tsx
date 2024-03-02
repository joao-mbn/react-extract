import React from 'react';

interface ComponentProps {
  items: string[];
}

function Component(props: ComponentProps) {
  const {
    items: [item1, item2, ...otherItems]
  } = props;

  return <Extracted item1={item1} item2={item2} otherItems={otherItems} />;
}

interface ExtractedProps {
  item1: string;
  item2: string;
  otherItems: string[];
}

function Extracted({ item1, item2, otherItems }: ExtractedProps) {
  return (
    <div className='my-class-2'>
      <div>{item1}</div>
      <div>{item2}</div>
      <div>{otherItems.join(', ')}</div>
    </div>
  );
}

