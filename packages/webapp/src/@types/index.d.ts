declare module '*.png';
declare module '*.svg';
declare module '*.wxml';
declare global {
  const isAuth: boolean;
  const mapId: number;
  const userOptions: { zoom: string | number } | null;
  const mindmapLocked: boolean;
  const mindmapLockedMsg: string;
  const mapTitle: string;
}
