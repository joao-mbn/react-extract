export function removeNonWordCharacters(value: string) {
  return value.replaceAll(/\W/g, '');
}

export function capitalizeComponentName(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function truncateType(type: string) {
  return type.length > 500 ? 'any' : type;
}

export function chooseAdequateType(resolvedType: string, heuristicType: string) {
  if (resolvedType !== 'any' && heuristicType === 'any') return resolvedType;
  if (resolvedType === 'any' && heuristicType !== 'any') return heuristicType;

  if (resolvedType !== 'any' && heuristicType !== 'any') {
    return resolvedType.length <= heuristicType.length ? resolvedType : heuristicType;
  }

  return 'any';
}

export function replacePropValues(prop: string, jsx: string) {
  const defaultMatcher = new RegExp(`\\s*{\\s*(\\b|\\.\\.\\.)(${prop})\\b(?!\\s*:)[\\w\\W]*?}`, 'gm');
  let result = jsx.replaceAll(defaultMatcher, (match, _, group2) => {
    return match.replace(group2, `props.${group2}`);
  });

  const explicitObjectPropsMatcher = new RegExp(`\\s*\\w+\\s*(:\\s*${prop})\\b`, 'gm');
  result = result.replaceAll(explicitObjectPropsMatcher, (match, group1) => {
    return match.replace(group1, `: props.${prop}`);
  });

  const spreadAmidstObjectPropertiesMatcher = new RegExp(`{{(?:(?!{{).)*?(\\.\\.\\.${prop})\\b.*?}}`, 'gm');
  result = result.replaceAll(spreadAmidstObjectPropertiesMatcher, (match, group1) => {
    return match.replace(group1, `...props.${prop}`);
  });

  const bracketMatcher = new RegExp(`(\\[.*?\\])`, 'gm');
  result = result.replaceAll(bracketMatcher, (bracketContent) => {
    const myClassMatcher = new RegExp(`\\b${prop}\\b`, 'g');
    return bracketContent.replaceAll(myClassMatcher, `props.myClass`);
  });

  return result;
}

