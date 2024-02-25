import React from 'react';

function Child({ Header }) {
  return (
    <div>
      {Header}
      <h1>Not a Footer</h1>
    </div>
  );
}

function Component() {
  return <Extracted />;
}

function Extracted() {
  return (
    <div>
      <Child Header={<header>Header</header>} />
      <footer>Indeed a footer</footer>
    </div>
  );
}
