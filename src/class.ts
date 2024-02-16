import { ExtractedProp } from './types';

// This class is used encapsulate the props object and its update, which is mounted without immutability.
export class ExtractedProps {
  props: Record<string, ExtractedProp> = {};

  constructor() {}

  updateProps(newProp: Omit<ExtractedProp, 'propAlias' | 'propId'>) {
    const propsWithSameName = Object.values(this.props).filter(({ name }) => name === newProp.name);
    const nonStaticPropsWithSameName = propsWithSameName.filter(({ isLiteral: isStatic }) => !isStatic);

    const countOfPropsWithSameName = propsWithSameName.length;
    const countOfNonStaticPropsWithSameName = nonStaticPropsWithSameName.length;

    const propId = `${newProp.name}${countOfPropsWithSameName === 0 ? '' : countOfPropsWithSameName + 1}`;
    const propAlias = `${newProp.name}${countOfNonStaticPropsWithSameName === 0 ? '' : countOfNonStaticPropsWithSameName + 1}`;

    this.props[propId] = { ...newProp, propAlias, propId };
  }
}
