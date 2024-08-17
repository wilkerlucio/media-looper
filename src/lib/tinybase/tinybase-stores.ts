import {readable, writable} from 'svelte/store';
import {getContext, setContext} from 'svelte';
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

export function setTinyContext(ctx: Context) {
  setContext('tinybase', ctx);
}

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

function useReader(container: any, name: string, ...args: any[]) {
  const getName = `get${name}`
  const listenerName = `add${name}Listener`

  return readable(container[getName](...args), (set) => {
    const listener = container[listenerName](...args, () => {
      set(container[getName](...args));
    })

    return () => container.delListener(listener)
  });
}

// region: values

export function useValues() {
  const store = getTinyContextForce('store');

  return useReader(store, 'Values')
}

export function useValueIds() {
  const store = getTinyContextForce('store');

  return useReader(store, 'ValueIds')
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

// endregion

// region: tabular

export function useTables() {
  const store = getTinyContextForce('store');

  return useReader(store, 'Tables')
}

export function useTableIds() {
  const store = getTinyContextForce('store');

  return useReader(store, 'TableIds')
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

export function useTableCellIds(tableId: Id) {
  const store = getTinyContextForce('store');

  return useReader(store, 'TableCellIds', tableId)
}

export function useRowIds(tableId: Id) {
  const store = getTinyContextForce('store');

  return useReader(store, 'RowIds', tableId)
  // return readable(store.getRowIds(tableId), (set) => {
  //   const listener = store.addRowIdsListener(tableId, (store, tableId) => {
  //     set(store.getRowIds(tableId));
  //   })
  //
  //   return () => store.delListener(listener)
  // });
}

export function useSortedRowIds(
  tableId: Id,
  cellId?: Id,
  descending?: boolean,
  offset?: number,
  limit?: number,
) {
  const store = getTinyContextForce('store');

  return useReader(store, 'SortedRowIds', tableId, cellId, descending, offset, limit)
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

export function useCellIds(tableId: Id) {
  const store = getTinyContextForce('store');

  return useReader(store, 'RowIds', tableId)
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

// endregion



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
