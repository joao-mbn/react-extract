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

  const myClass = 'myClass';
  const mmyClass = 'mmyClass';
  const myClass1 = 'myClass1';
  const myClass2 = 'myClass2';
  const nestedProp = { value: { default: 'default' } };
  const condition = true;

  return (
    <>
      <Child
        model={{ shortHand, shortHandFunction, shortHandAnonymousFunction, shortHandConstantInFile }}
        objectWithShortHand={objectWithShortHand}
        onClick={() => {
          const shortHandToIgnore = 'propShortHand';
          const shortHandObject = { shortHandToIgnore };
          console.log(JSON.stringify(shortHandObject));
        }}
      />
      <Child myClass={myClass1} />
      <Child myClass={mmyClass} />
      <Child myClass={myClass + 'value'} />
      <Child values={[...myClass, myClass]} values2={[myClass, myClass1]} values3={[...myClass]} />
      <Child style={{ ...myClass }}>{myClass}</Child>
      <Child style={{ myClass, anotherClass: myClass, ...myClass, myClassToo: myClass1, myClassToo: myClass }} />
      <Child values={{ myClass }} />
      <Child values={{ myClass, myClass1 }} />
      <Child values={{ myClass1, myClass, myClass2 }} />
      <Child values={nestedProp.value} />
      <Child values={[nestedProp.value]} />
      <Child values={{ value: nestedProp.value }} />
      <Child values={{ value: !nestedProp.value }} />
      <Child values={{ value: nestedProp.value.default }} />
      <Child values={{ value: nestedProp.value.default }} />
      <Child values={{ value: nestedProp?.value.default }} />
      <Child values={{ value: 10 * 25 + (nestedProp?.value.default + nestedProp?.value.default) }} />
      <Child
        values={{
          value: condition ? nestedProp?.value.default + nestedProp?.value.default : myClass
        }}
      />
      <Child values={{ ...nestedProp.value.default }} />
      <Child disabled />
    </>
  );
}

