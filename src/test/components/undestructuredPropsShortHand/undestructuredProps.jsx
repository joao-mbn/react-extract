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
    <Child
      model={{ shortHand, shortHandFunction, shortHandAnonymousFunction, shortHandConstantInFile }}
      objectWithShortHand={objectWithShortHand}
      onClick={() => {
        const shortHandToIgnore = 'propShortHand';
        const shortHandObject = { shortHandToIgnore };
        console.log(JSON.stringify(shortHandObject));
      }}
    />
  );
}

