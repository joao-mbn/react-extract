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
    <Child
      model={{ shortHand, shortHandFunction, shortHandAnonymousFunction }}
      objectWithShortHand={objectWithShortHand}
    />
  );
}
