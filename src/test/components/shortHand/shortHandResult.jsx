import React from 'react';

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

function Extracted({ objectWithShortHand, shortHand, shortHandAnonymousFunction, shortHandFunction }) {
  return (
    <Child
      model={{ shortHand, shortHandFunction, shortHandAnonymousFunction }}
      objectWithShortHand={objectWithShortHand}
    />
  );
}
