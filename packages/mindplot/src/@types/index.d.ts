declare module '*.svg' {
  const content: string;
  export default content;
}

interface ImportMeta {
  glob: (pattern: string, options?: { eager?: boolean }) => Record<string, unknown>;
}
