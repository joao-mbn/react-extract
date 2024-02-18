import React from "react";

class MyClass {
  myProperty = 'hello';
  myMethod () {
    return 'world'
  }
}

function Child (props: any) {
  return <div>{props}</div>
}

function Component(props: any) {
  const explicit = "label";
  const shortHand = "shortHand";
  const model = [
    { label: "label1", value: "value1", shortHand: '' },
    { label: "label2", value: "value2", shortHand: '' },
  ];
  const { bindingElement, ...bindingElementDestructure } = props;
  const myClass = new MyClass();
  function testFunction() {
    return "test"
  }

  return (
    <Extracted
      bindingElement={bindingElement}
      bindingElementDestructure={bindingElementDestructure}
      explicit={explicit}
      model={model}
      myClass={myClass}
      props={props}
      shortHand={shortHand}
      testFunction={testFunction}
    />
  );
}

interface ExtractedProps {
  model: { label: string; value: string; shortHand: string; }[];
  explicit: "label";
  testFunction: () => string;
  bindingElement: any;
  bindingElementDestructure: any;
  props: any;
  myClass: MyClass;
  shortHand: string;
}

function Extracted({
  model,
  explicit,
  testFunction,
  bindingElement,
  bindingElementDestructure,
  props,
  myClass,
  shortHand,
}: ExtractedProps) {
  return (
    <div>
      {model.map((item, index) => (
        <div key={index}>{item.value}</div>
      ))}
      <Child model={model} />
      <Child model={[{ explicit: explicit, shortHand }]} />
      <Child
        testVariable={explicit}
        testFunction={testFunction}
        bindingElement={bindingElement}
        bindingElementDestructure={bindingElementDestructure}
      />
      <Child
        model={props}
        testClass={myClass}
        testMethod={myClass.myMethod}
        testProperty={myClass.myProperty}
        classNewInstance={new MyClass()}
      />
    </div>
  );
}
