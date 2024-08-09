import { readable, writable } from 'svelte/store';
import { getContext, onDestroy } from 'svelte';
import type {Id, Queries, Relationships, Row, Store, Value} from 'tinybase';

export function getStore(): Store | undefined {
  const { store }: { store: Store } = getContext('tinybase') || {};

  return store;
}

export function getStoreForce(): Store {
  const store = getStore();

  if (!store) throw new Error('Store not found in context');

  return store;
}

export function getRelationships() {
  const { relationships }: { relationships: Relationships } = getContext('tinybase') || {};

  return relationships;
}

export function getQueries(): Queries | undefined {
  const { queries }: { queries: Queries } = getContext('tinybase') || {};

  return queries;
}

export function getQueriesForce(): Queries {
  const queries = getQueries();

  if (!queries) throw new Error('Queries not found in context');

  return queries;
}

export function useValue(id: Id, defaultValue?: Value) {
  const store = getStoreForce();

  const { subscribe } = writable(store.getValue(id) || defaultValue, (set) => {
    const listener = store.addValueListener(id, (store, valueId, newValue) => {
      set(newValue)
    })

    return () => store.delListener(listener)
  });

  return {
    subscribe,
    set: (x: Value) => {
      store.setValue(id, x)
    }
  }
}

export function useTable(tableId: Id) {
  const store = getStoreForce();

  return readable(store.getTable(tableId), (set) => {
    const listener = store.addTableListener(tableId, (store, tableId) => {
      set(store.getTable(tableId));
    })

    return () => store.delListener(listener)
  });
}

export function useRowIds(tableId: Id) {
  const store = getStoreForce();

  return readable(store.getRowIds(tableId), (set) => {
    const listener = store.addRowIdsListener(tableId, (store, tableId) => {
      set(store.getRowIds(tableId));
    })

    return () => store.delListener(listener)
  });
}

export function useRow(tableId: Id, rowId: Id) {
  const store = getStoreForce();

  const { subscribe } = writable(store.getRow(tableId, rowId), (set) => {
    const listener = store.addRowListener(tableId, rowId, () => {
      set(store.getRow(tableId, rowId));
    })

    return () => store.delListener(listener)
  });

  return {
    subscribe,
    set: (x: Row) => {
      store.setRow(tableId, rowId, x)
    }
  }
}

export function useCell(tableId: Id, rowId: Id, cellId: Id, defaultValue?: Value) {
  const store = getStoreForce();

  const { subscribe } = writable(store.getCell(tableId, rowId, cellId) || defaultValue, (set) => {
    const listener = store.addCellListener(tableId, rowId, cellId, (store, tableId, rowId, cellId, newCell) => {
      set(newCell)
    })

    return () => store.delListener(listener)
  });

  return {
    subscribe,
    set: (x: Value) => {
      store.setCell(tableId, rowId, cellId, x)
    }
  }
}

export function useRelationshipLocalRowIds(relationshipId: Id, remoteRowId: Id) {
  const relationships = getRelationships()

  return readable(relationships.getLocalRowIds(relationshipId, remoteRowId), (set) => {
    const listener = relationships.addLocalRowIdsListener(relationshipId, remoteRowId, (relationships, relationshipId, remoteRowId) => {
      set(relationships.getLocalRowIds(relationshipId, remoteRowId));
    })

    return () => relationships.delListener(listener)
  });
}

export function useQueriesResultTable(queryId: Id, table?: Id, query?: any) {
  const queries = getQueriesForce();

  if (table && query) {
    queries.setQueryDefinition(queryId, table, query)
  }

  return readable(queries.getResultTable(queryId), (set) => {
    const listener = queries.addResultTableListener(queryId, (queries) => {
      set(queries.getResultTable(queryId));
    })

    return () => {
      queries.delListener(listener)

      if (table && query) {
        queries.delQueryDefinition(queryId)
      }
    }
  });
}
