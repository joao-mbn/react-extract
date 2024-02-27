import React from 'react';

function Child(props: any) {
  return <div>{props}</div>;
}

function Component(props: any) {
  const shortHand = 'shortHand';
  function shortHandFunction() {
    return 'test';
  }
  const shortHandAnonymousFunction = () => 'test';
  const objectWithShortHand = { shortHand, shortHandFunction, shortHandAnonymousFunction };

  return (
    <Extracted
      objectWithShortHand={objectWithShortHand}
      shortHand={shortHand}
      shortHandAnonymousFunction={shortHandAnonymousFunction}
      shortHandFunction={shortHandFunction}
    />
  );
}

interface ExtractedProps {
  objectWithShortHand: { shortHand: string; shortHandFunction: () => string; shortHandAnonymousFunction: () => string };
  shortHand: string;
  shortHandAnonymousFunction: () => string;
  shortHandFunction: () => string;
}

function Extracted({ objectWithShortHand, shortHand, shortHandAnonymousFunction, shortHandFunction }: ExtractedProps) {
  return (
    <Child
      model={{ shortHand, shortHandFunction, shortHandAnonymousFunction }}
      objectWithShortHand={objectWithShortHand}
    />
  );
}
