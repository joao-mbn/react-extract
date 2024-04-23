import React from 'react';
import { shortHandImport } from './export';

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

function Extracted({ objectWithShortHand, shortHand, shortHandAnonymousFunction, shortHandFunction }: ExtractedProps) {
  return (
    <Child
      model={{ shortHand, shortHandFunction, shortHandAnonymousFunction, shortHandImport, shortHandConstantInFile }}
      objectWithShortHand={objectWithShortHand}
      onClick={() => {
        const shortHandToIgnore = 'propShortHand';
        const shortHandObject = { shortHandToIgnore };
        console.log(JSON.stringify(shortHandObject));
      }}
    />
  );
}

