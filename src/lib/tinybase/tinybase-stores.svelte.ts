import {readable, writable} from 'svelte/store';
import {getContext, setContext} from 'svelte';
import type {
  Checkpoints,
  Id,
  Indexes,
  MergeableStore,
  Metrics,
  Queries,
  Relationships,
  Row,
  Store,
  Value
} from 'tinybase';
import type {Group, Having, Join, Select, Where} from "tinybase/queries";
import {stateProxy} from "@/lib/stores/nested-state.svelte";

type GenericStore = Store | MergeableStore

export type Context = {
  store: Store
  metrics?: Metrics
  indexes?: Indexes
  relationships?: Relationships
  checkpoints?: Checkpoints
  queries?: Queries
  localStore?: Store
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

  let x = $state(container[getName](...args))

  $effect.pre(() => {
    const listener = container[listenerName](...args, () => {
      x = container[getName](...args);
    })

    return () => container.delListener(listener)
  })

  return { get value() { return x }}
}

// region: values

export function useValues(store: GenericStore) {
  return useReader(store, 'Values')
}

export function useValueIds(store: GenericStore) {
  return useReader(store, 'ValueIds')
}

export function useValue(store: GenericStore, id: Id, defaultValue?: Value) {
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

export function useTables(store: GenericStore) {
  return useReader(store, 'Tables')
}

export function useTableIds(store: GenericStore) {
  return useReader(store, 'TableIds')
}

export function useTable(store: GenericStore, tableId: Id) {
  return useReader(store, 'Table', tableId)
}

export function useTableCellIds(store: GenericStore, tableId: Id) {
  return useReader(store, 'TableCellIds', tableId)
}

export function useRowIds(store: GenericStore, tableId: Id) {
  return useReader(store, 'RowIds', tableId)
}

export function useSortedRowIds(
  store: GenericStore,
  tableId: Id,
  cellId?: Id,
  descending?: boolean,
  offset?: number,
  limit?: number,
) {
  return useReader(store, 'SortedRowIds', tableId, cellId, descending, offset, limit)
}

export function useRow(store: GenericStore, tableId: Id, rowId: Id) {
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

export function useRow2<T extends Object>(store: GenericStore, tableId: Id, rowId: Id) {
  let x = $state(store.getRow(tableId, rowId))

  $effect.pre(() => {
    const listener = store.addRowListener(tableId, rowId, () => {
      const row = store.getRow(tableId, rowId)

      for (const k in row) {
        x[k] = row[k]
      }
    })

    return () => store.delListener(listener)
  })

  return stateProxy(x as unknown as T, (newValue) => {
    store.setRow(tableId, rowId, newValue as unknown as Row)
  })
}

export function useCellIds(store: GenericStore, tableId: Id) {
  return useReader(store, 'RowIds', tableId)
}

export function useCell(store: GenericStore, tableId: Id, rowId: Id, cellId: Id, defaultValue?: Value) {
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

export function useRelationshipLocalRowIds(relationships: Relationships, relationshipId: Id, remoteRowId: Id) {
  return readable(relationships.getLocalRowIds(relationshipId, remoteRowId), (set) => {
    const listener = relationships.addLocalRowIdsListener(relationshipId, remoteRowId, (relationships, relationshipId, remoteRowId) => {
      set(relationships.getLocalRowIds(relationshipId, remoteRowId));
    })

    return () => relationships.delListener(listener)
  });
}

type QueryBuilder = (keywords: {
  select: Select;
  join: Join;
  where: Where;
  group: Group;
  having: Having;
}) => void

export function useQueriesResultTable(queries: Queries, queryId: Id, table?: Id, query?: QueryBuilder) {
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
