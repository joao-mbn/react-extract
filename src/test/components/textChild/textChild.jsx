import React from 'react';

function Component() {
  const greeting = 'Ça va? Ça va!';

  return (
    <div className='w-full'>
      <div>In French, a conversation can enter an infinite loop with: {greeting}</div>
      <div>Be careful!</div>
    </div>
  );
}
