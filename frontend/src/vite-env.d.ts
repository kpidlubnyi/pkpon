/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@mapbox/polyline' {
  export function decode(str: string, precision?: number): [number, number][];

  export function encode(coords: [number, number][], precision?: number): string;

  export function toGeoJSON(str: string, precision?: number): {
    type: 'LineString';
    coordinates: [number, number][];
  };

  export function fromGeoJSON(
    geojson: { type: 'LineString'; coordinates: [number, number][] },
    precision?: number
  ): string;

  const polyline: {
    decode: typeof decode;
    encode: typeof encode;
    toGeoJSON: typeof toGeoJSON;
    fromGeoJSON: typeof fromGeoJSON;
  };

  export default polyline;
}