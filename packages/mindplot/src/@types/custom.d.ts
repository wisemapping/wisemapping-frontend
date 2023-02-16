declare module '*.svg' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any;
  export default content;
}
// @Hack: This should not be here ....
declare global {
  const isAuth: boolean;
  const mapId: number;
  const historyId: number;
  const userOptions: { zoom: string | number } | null;
  const mindmapLocked: boolean;
  const mindmapLockedMsg: string;
  const mapTitle: string;
}
