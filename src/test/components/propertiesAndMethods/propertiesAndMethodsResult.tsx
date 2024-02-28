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

  return <Extracted model1={model1} model2={model2} model3={model3} model4={model4} myClass={myClass} />;
}

interface ExtractedProps {
  model1: { label: string };
  model2: { valueFunction: () => string };
  model3: { evaluatedFunction: () => string };
  model4: { nested: { nestedValue: string } };
  myClass: MyClass;
}

function Extracted({ model1, model2, model3, model4, myClass }: ExtractedProps) {
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
