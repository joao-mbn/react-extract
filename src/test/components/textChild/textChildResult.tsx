import React from 'react';

function Component() {
  const greeting: string = 'Ça va? Ça va!';

  return <Extracted greeting={greeting} />;
}

interface ExtractedProps {
  greeting: string;
}

function Extracted({ greeting }: ExtractedProps) {
  return (
    <div className='w-full'>
      <div>In French, a conversation can enter an infinite loop with: {greeting}</div>
      <div>Be careful!</div>
    </div>
  );
}
