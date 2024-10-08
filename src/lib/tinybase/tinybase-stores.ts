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

export type GenericStore = Store | MergeableStore

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

  return readable(container[getName](...args), (set) => {
    const listener = container[listenerName](...args, () => {
      set(container[getName](...args));
    })

    return () => container.delListener(listener)
  });
}

// region: values

export function useValues(store: GenericStore) {
  return useReader(store, 'Values')
}

export function useValueIds(store: GenericStore) {
  return useReader(store, 'ValueIds')
}

export function useValue<T>(store: GenericStore, id: Id, defaultValue?: T) {
  const { subscribe } = writable(store.getValue(id) as unknown as T || defaultValue, (set) => {
    const listener = store.addValueListener(id, (store, valueId, newValue) => {
      set(newValue as unknown as T)
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

export function useRow<T extends Object>(store: GenericStore, tableId: Id, rowId: Id) {
  const { subscribe } = writable(store.getRow(tableId, rowId) as unknown as T, (set) => {
    const listener = store.addRowListener(tableId, rowId, () => {
      set(store.getRow(tableId, rowId) as unknown as T);
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
