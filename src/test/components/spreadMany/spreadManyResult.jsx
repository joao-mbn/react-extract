import React from 'react';

function Component({ onClick, ...props }) {
  const {
    min,
    max: maximum,
    ...inputProps
  } = {
    min: Math.floor(Math.random() * 100),
    max: 20,
    onChange: () => {},
    className: 'bg-red-200',
  };
  const spanProps = { children: 'Text', className: 'bg-red-500' };
  const buttonProps = { onClick: () => {}, className: 'bg-red-300' };

  return (
    <Extracted
      maximum={maximum}
      min={min}
      onClick={onClick}
      props={props}
      inputProps={inputProps}
      spanProps={spanProps}
      buttonProps={buttonProps}
    />
  );
}

function Extracted({ maximum, min, onClick, props, inputProps, spanProps, buttonProps }) {
  return (
    <div className='w-full'>
      <div onClick={onClick} {...props}>
        Another Test
      </div>
      <input min={min} max={maximum} {...inputProps} />
      <span {...spanProps}></span>
      <button {...buttonProps}></button>
    </div>
  );
}
