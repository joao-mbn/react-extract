import { ExtractedProp } from './types';

// This class is used encapsulate the props object and its update, which is mounted without immutability.
export class ExtractedProps {
  props: Record<string, ExtractedProp> = {};

  constructor() {}

  updateProps(newProp: Omit<ExtractedProp, 'propAlias'>) {
    const countOfPropsWithSameName = Object.values(this.props).filter(({ name: prop }) => prop === newProp.name).length;
    const propAlias = `${newProp.name}${countOfPropsWithSameName === 0 ? '' : countOfPropsWithSameName + 1}`;
    this.props[propAlias] = { ...newProp, propAlias };
  }
}
