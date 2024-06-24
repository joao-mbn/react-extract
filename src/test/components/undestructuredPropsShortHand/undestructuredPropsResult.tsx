import React from 'react';

const shortHandConstantInFile = 'shortHandConstantInFile';

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

function Extracted(props: ExtractedProps) {
  return (
    <Child
      model={{
        shortHand: props.shortHand,
        shortHandFunction: props.shortHandFunction,
        shortHandAnonymousFunction: props.shortHandAnonymousFunction,
        shortHandConstantInFile
      }}
      objectWithShortHand={props.objectWithShortHand}
      onClick={() => {
        const shortHandToIgnore = 'propShortHand';
        const shortHandObject = { shortHandToIgnore };
        console.log(JSON.stringify(shortHandObject));
      }}
    />
  );
}

