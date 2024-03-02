export function removeNonWordCharacters(value: string) {
  return value.replaceAll(/\W/g, '');
}

export function capitalizeComponentName(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function truncateType(type: string) {
  return type.length > 500 ? 'any' : type;
}
