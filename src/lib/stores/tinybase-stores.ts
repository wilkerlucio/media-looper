import { readable, writable } from 'svelte/store';
import { getContext, onDestroy } from 'svelte';
import type { Id, Relationships, Row, Store, Value } from 'tinybase';

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

function autoDestroy(container: {delListener: (listenerId: Id) => typeof container}, listener: string) {
  onDestroy(() => container.delListener(listener));
}

export function useValue(id: Id, defaultValue?: Value) {
  const store = getStoreForce();

  const { subscribe, set } = writable(store.getValue(id) || defaultValue);

  autoDestroy(store, store.addValueListener(id, (store, valueId, newValue) => {
    set(newValue)
  }))

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
    autoDestroy(store, store.addTableListener(tableId, (store, tableId) => {
      set(store.getTable(tableId));
    }));
  });
}

export function useRowIds(tableId: Id) {
  const store = getStoreForce();

  return readable(store.getRowIds(tableId), (set) => {
    autoDestroy(store, store.addRowIdsListener(tableId, (store, tableId) => {
      set(store.getRowIds(tableId));
    }));
  });
}

export function useRow(tableId: Id, rowId: Id) {
  const store = getStoreForce();

  const { subscribe, set } = writable(store.getRow(tableId, rowId));

  autoDestroy(store, store.addRowListener(tableId, rowId, () => {
    set(store.getRow(tableId, rowId));
  }));

  return {
    subscribe,
    set: (x: Row) => {
      store.setRow(tableId, rowId, x)
    }
  }
}

export function useCell(tableId: Id, rowId: Id, cellId: Id, defaultValue?: Value) {
  const store = getStoreForce();

  const { subscribe, set } = writable(store.getCell(tableId, rowId, cellId) || defaultValue, () => {
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
    autoDestroy(relationships, relationships.addLocalRowIdsListener(relationshipId, remoteRowId, (relationships, relationshipId, remoteRowId) => {
      set(relationships.getLocalRowIds(relationshipId, remoteRowId));
    }));
  });
}
