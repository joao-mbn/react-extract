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
  const inlineObjectMatcher = /({{.*?}})/g;
  let result = jsx.replaceAll(inlineObjectMatcher, (match) => {
    const spreadMatcher = new RegExp(`\\.\\.\\.${prop}\\b`, 'gm');
    match = match.replaceAll(spreadMatcher, `...props.${prop}`);

    const explicitPropMatcher = new RegExp(`\\s*\\w+\\s*(:\\s*${prop})\\b`, 'gm');
    match = match.replaceAll(explicitPropMatcher, (match, group1) => {
      return match.replace(group1, `: props.${prop}`);
    });

    const shortHandMatcher = new RegExp(`(?<!\\.)\\b${prop}\\b(?!\\s*:)`, 'gm');
    match = match.replaceAll(shortHandMatcher, `${prop}: props.${prop}`);

    return match;
  });

  const bracketMatcher = /({\s*\[.*?\]\s*})/gm;
  result = result.replaceAll(bracketMatcher, (match) => {
    const myClassMatcher = new RegExp(`\\b${prop}\\b`, 'g');
    return match.replaceAll(myClassMatcher, `props.${prop}`);
  });

  const defaultMatcher = new RegExp(`\\s*{\\s*(\\b|\\.\\.\\.)(${prop})\\b(?!\\s*:)[\\w\\W]*?}`, 'gm');
  result = result.replaceAll(defaultMatcher, (match, _, group2) => {
    return match.replace(group2, `props.${group2}`);
  });

  return result;
}

