import React from 'react';

class MyClass {
  myProperty = 'hello';
  myMethod() {
    return 'world';
  }
}

function Child(props: any) {
  return <div>{props}</div>;
}

function Component(props: any) {
  const model1 = { label: 'label1' };
  const model2 = { valueFunction: () => 'value1' };
  const model3 = { evaluatedFunction: () => 'evaluated' };
  const model4 = { nested: { nestedValue: 'nested' } };
  const myClass = new MyClass();

  return (
    <Child
      label={model1.label}
      valueFunction={model2.valueFunction}
      evaluatedFunction={model3.evaluatedFunction()}
      nestedValue={model4.nested.nestedValue}
      myProperty={myClass.myProperty}
      myMethod={myClass.myMethod}
    />
  );
}

