export function locatedStoreWhere() {
  return {
    latitude: { not: null },
    longitude: { not: null },
  };
}

export function locatedStoreRelationWhere() {
  return {
    store: locatedStoreWhere(),
  };
}
