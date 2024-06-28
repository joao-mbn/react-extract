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

