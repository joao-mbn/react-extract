import React, { ComponentPropsWithoutRef } from 'react';

function Component({ onClick, ...props }: ComponentPropsWithoutRef<'div'>) {
  const {
    min,
    max: maximum,
    ...inputProps
  }: ComponentPropsWithoutRef<'input'> = {
    min: Math.floor(Math.random() * 100),
    max: 20,
    onChange: () => {},
    className: 'bg-red-200'
  };
  const spanProps = { children: 'Text', className: 'bg-red-500' };
  const buttonProps: ComponentPropsWithoutRef<'button'> = { onClick: () => {}, className: 'bg-red-300' };

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

interface ExtractedProps {
  maximum: number;
  min: number;
  onClick: React.MouseEventHandler<HTMLDivElement> | undefined;
  props: Omit<ComponentPropsWithoutRef<'div'>, 'onClick'>;
  inputProps: Omit<ComponentPropsWithoutRef<'input'>, 'min' | 'maximum'>;
  spanProps: { children: string; className: string };
  buttonProps: ComponentPropsWithoutRef<'button'>;
}

function Extracted({ maximum, min, onClick, props, inputProps, spanProps, buttonProps }: ExtractedProps) {
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
