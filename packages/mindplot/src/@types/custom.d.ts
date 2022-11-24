declare module '*.svg' {
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
