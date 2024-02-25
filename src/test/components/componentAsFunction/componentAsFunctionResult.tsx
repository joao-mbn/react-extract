import React, { ReactNode } from 'react';

function Child({ renderHeader }: { renderHeader: (title: string) => ReactNode }) {
  return (
    <div>
      {renderHeader('Child' + Math.random().toFixed(2))}
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
      <Child renderHeader={(title) => <header>{title}</header>} />
      <footer>Indeed a footer</footer>
    </div>
  );
}
