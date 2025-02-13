import { Feature, LineString, Point } from './types';
import { getPoiClass } from './getPoiClass';
import { getCenter } from './getCenter';
import { OsmApiId } from './helpers';
import { fetchJson } from './fetch';

const overpassQuery = (bbox, tags) => {
  const query = tags
    .map(([k, v]) => (v === '*' ? `["${k}"]` : `["${k}"="${v}"]`))
    .join('');

  return `[out:json][timeout:25];
  (
    node${query}(${bbox});
    way${query}(${bbox});
    relation${query}(${bbox});
  );
  out body;
  >;
  out skel qt;`;
  // consider: out body geom
};

const getOverpassUrl = ([a, b, c, d], tags) =>
  `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
    overpassQuery([d, a, b, c], tags),
  )}`;

const notNull = (x) => x != null;

// maybe take inspiration from https://github.com/tyrasd/osmtogeojson/blob/gh-pages/index.js
export const osmJsonToSkeletons = (response: any): Feature[] => {
  const nodesById = response.elements
    .filter((element) => element.type === 'node')
    .reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});

  const getGeometry2 = {
    node: ({ lat, lon }): Point => ({ type: 'Point', coordinates: [lon, lat] }),
    way: (way): LineString => {
      const { nodes } = way;
      return {
        type: 'LineString', // TODO distinguish area - match id-presets, then add icon for polygons
        coordinates: nodes
          ?.map((nodeId) => nodesById[nodeId])
          .map(({ lat, lon }) => [lon, lat]),
      };
    },
    relation: ({ members }): LineString => ({
      type: 'LineString',
      coordinates: members[0]?.geometry // TODO make proper relation handling
        ?.filter(notNull)
        ?.map(({ lat, lon }) => [lon, lat]),
    }),
  };

  return response.elements.map((element) => {
    const { type, id, tags = {} } = element;
    const geometry = getGeometry2[type]?.(element);
    return {
      type: 'Feature',
      osmMeta: { type, id },
      tags,
      properties: { ...getPoiClass(tags), ...tags },
      geometry,
      center: getCenter(geometry) ?? undefined,
    };
  });
};

const convertOsmIdToMapId = (apiId: OsmApiId) => {
  const osmToMapType = { node: 0, way: 1, relation: 4 };
  return parseInt(`${apiId.id}${osmToMapType[apiId.type]}`, 10);
};

export async function performOverpassSearch(
  bbox,
  tags: Record<string, string>,
) {
  console.log('seaching overpass for tags: ', tags); // eslint-disable-line no-console
  const overpass = await fetchJson(getOverpassUrl(bbox, Object.entries(tags)));
  console.log('overpass result:', overpass); // eslint-disable-line no-console

  const features = osmJsonToSkeletons(overpass)
    .filter((feature) => feature.center && Object.keys(feature.tags).length > 0)
    .map((feature) => ({
      ...feature,
      id: convertOsmIdToMapId(feature.osmMeta),
    }));

  console.log('overpass geojson', features); // eslint-disable-line no-console

  return { type: 'FeatureCollection', features };
}
