import {readable, writable} from 'svelte/store';
import {getContext} from 'svelte';
import type {Checkpoints, Id, Indexes, Metrics, Queries, Relationships, Row, Store, Value} from 'tinybase';
import type {Group, Having, Join, Select, Where} from "tinybase/queries";

export type Context = {
  store: Store
  metrics?: Metrics
  indexes?: Indexes
  relationships?: Relationships
  checkpoints?: Checkpoints
  queries?: Queries
}

export type ContextItem = keyof Context

export function getTinyContext<T extends ContextItem | undefined>(item?: T): T extends ContextItem ? Context[T] : Context {
  const ctx: Context = getContext('tinybase') || {};

  if (item) {
    return ctx[item] as T extends ContextItem ? Context[T] : never;
  }

  return ctx as T extends ContextItem ? Context[T] : Context;
}

export function getTinyContextForce<T extends ContextItem>(item: T): Required<Context>[T] {
  const ctx = getTinyContext() as Required<Context>

  if (!ctx[item]) throw new Error(item + ' not found in context.')

  return ctx[item]
}

export function useValue(id: Id, defaultValue?: Value) {
  const store = getTinyContextForce('store');

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
  const store = getTinyContextForce('store');

  return readable(store.getTable(tableId), (set) => {
    const listener = store.addTableListener(tableId, (store, tableId) => {
      set(store.getTable(tableId));
    })

    return () => store.delListener(listener)
  });
}

export function useRowIds(tableId: Id) {
  const store = getTinyContextForce('store');

  return readable(store.getRowIds(tableId), (set) => {
    const listener = store.addRowIdsListener(tableId, (store, tableId) => {
      set(store.getRowIds(tableId));
    })

    return () => store.delListener(listener)
  });
}

export function useRow(tableId: Id, rowId: Id) {
  const store = getTinyContextForce('store');

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
  const store = getTinyContextForce('store');

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
  const relationships = getTinyContextForce('relationships');

  return readable(relationships.getLocalRowIds(relationshipId, remoteRowId), (set) => {
    const listener = relationships.addLocalRowIdsListener(relationshipId, remoteRowId, (relationships, relationshipId, remoteRowId) => {
      set(relationships.getLocalRowIds(relationshipId, remoteRowId));
    })

    return () => relationships.delListener(listener)
  });
}

export function useQueriesResultTable(queryId: Id, table?: Id, query?: (keywords: {
  select: Select;
  join: Join;
  where: Where;
  group: Group;
  having: Having;
}) => void) {
  const queries = getTinyContextForce('queries');

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
