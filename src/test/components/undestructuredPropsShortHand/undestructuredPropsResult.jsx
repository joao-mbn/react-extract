import React from 'react';

const shortHandConstantInFile = 'shortHandConstantInFile';

function Child(props) {
  return <div>{props}</div>;
}

function Component(props) {
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

function Extracted(props) {
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

