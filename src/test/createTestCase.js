const fs = require('fs');
const path = require('path');

const testName = process.argv[2];

const testPath = path.join(__dirname, './components/', testName);

if (!fs.existsSync(testPath)) {
  fs.mkdirSync(testPath, { recursive: true });
}

const testFiles = [`${testName}.jsx`, `${testName}.tsx`];
testFiles.forEach((file) => {
  fs.writeFileSync(
    path.join(testPath, file),
    `
import React from 'react';

function Component() {
  return (
    <div className='my-class-2'>
      <div className='my-class'>Test</div>
      <span className={'string-literal'}></span>
    </div>
  );
}
    `,
    'utf8'
  );
});

const resultFiles = [`${testName}Result.jsx`, `${testName}Result.tsx`];
resultFiles.forEach((file) => {
  fs.writeFileSync(
    path.join(testPath, file),
    `
import React from 'react';

function Component() {
  return <Extracted />;
}

function Extracted() {
  return (
    <div className='my-class-2'>
      <div className='my-class'>Test</div>
      <span className={'string-literal'}></span>
    </div>
  );
}
    `,
    'utf8'
  );
});
