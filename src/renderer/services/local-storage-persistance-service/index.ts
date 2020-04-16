import { Consumer } from '../../types';

const initedItems = new Set<string>();

export interface LoadRequest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: Consumer<any>;
}

export interface SaveRequest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any;
}

export function load(asks: LoadRequest): void {
  Object.entries(asks).forEach(([name, consumer]) => {
    const stored = localStorage.getItem(name);
    if (stored !== null) {
      consumer(JSON.parse(stored));
      initedItems.add(name);
    }
  });
}

export function loadOnInit(asks: LoadRequest): void {
  load(Object.fromEntries(Object.entries(asks).filter(([name]) => !initedItems.has(name))));
}

export function save(asks: SaveRequest): void {
  Object.entries(asks).forEach(([name, data]) => {
    localStorage.setItem(name, JSON.stringify(data));
    initedItems.add(name);
  });
}
