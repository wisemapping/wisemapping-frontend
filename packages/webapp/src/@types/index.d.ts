declare module '*.png';
declare module '*.svg';
declare module '*.wxml';

interface ImportMeta {
  glob: (pattern: string, options?: { eager?: boolean }) => Record<string, unknown>;
}
