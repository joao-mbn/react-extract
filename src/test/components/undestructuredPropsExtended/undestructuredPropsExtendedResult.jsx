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
    <Extracted
      condition={condition}
      mmyClass={mmyClass}
      myClass={myClass}
      myClass1={myClass1}
      myClass2={myClass2}
      nestedProp={nestedProp}
      objectWithShortHand={objectWithShortHand}
      shortHand={shortHand}
      shortHandAnonymousFunction={shortHandAnonymousFunction}
      shortHandFunction={shortHandFunction}
    />
  );
}

function Extracted(props) {
  return (
    <>
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
      <Child myClass={props.myClass1} />
      <Child myClass={props.mmyClass} />
      <Child myClass={props.myClass + 'value'} />
      <Child
        values={[...props.myClass, props.myClass]}
        values2={[props.myClass, props.myClass1]}
        values3={[...props.myClass]}
      />
      <Child style={{ ...props.myClass }}>{props.myClass}</Child>
      <Child
        style={{
          myClass: props.myClass,
          anotherClass: props.myClass,
          ...props.myClass,
          myClassToo: props.myClass1,
          myClassToo: props.myClass
        }}
      />
      <Child values={{ myClass: props.myClass }} />
      <Child values={{ myClass: props.myClass, myClass1: props.myClass1 }} />
      <Child values={{ myClass1: props.myClass1, myClass: props.myClass, myClass2: props.myClass2 }} />
      <Child values={props.nestedProp.value} />
      <Child values={[props.nestedProp.value]} />
      <Child values={{ value: props.nestedProp.value }} />
      <Child values={{ value: !props.nestedProp.value }} />
      <Child values={{ value: props.nestedProp.value.default }} />
      <Child values={{ value: props.nestedProp.value.default }} />
      <Child values={{ value: props.nestedProp?.value.default }} />
      <Child values={{ value: 10 * 25 + (props.nestedProp?.value.default + props.nestedProp?.value.default) }} />
      <Child
        values={{
          value: props.condition ? props.nestedProp?.value.default + props.nestedProp?.value.default : props.myClass
        }}
      />
      <Child values={{ ...props.nestedProp.value.default }} />
      <Child disabled />
    </>
  );
}

