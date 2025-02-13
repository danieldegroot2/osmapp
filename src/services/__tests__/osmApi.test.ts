import { addFeatureCenterToCache, fetchFeature } from '../osmApi';
import * as helpers from '../../components/helpers';
import * as fetch from '../fetch';
import {
  node,
  nodeFeature,
  relation,
  relationFeature,
  way,
  wayFeature,
} from './osmApi.fixture';
import { intl } from '../intl';
import * as tagging from '../tagging/translations';
import * as idTaggingScheme from '../tagging/idTaggingScheme';
import { requestLines } from '../../components/FeaturePanel/PublicTransport/requestRoutes';

const osm = (item) => ({ elements: [item] });
const overpass = {
  elements: [{ center: { lat: 50, lon: 14 } }],
};

// fetchFeature() fetches the translations for getSchemaForFeature()
// TODO maybe refactor it without need for intl?
intl.lang = 'en';
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: { languages: ['en'] },
}));

describe('fetchFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(tagging, 'fetchSchemaTranslations').mockResolvedValue(undefined);
    jest
      .spyOn(idTaggingScheme, 'getSchemaForFeature')
      .mockReturnValue(undefined); // this is covered in idTaggingScheme.test.ts
  });

  const isServer = jest.spyOn(helpers, 'isServer').mockReturnValue(true);
  const isBrowser = jest.spyOn(helpers, 'isBrowser').mockReturnValue(false);

  it('should work for node', async () => {
    const fetchJson = jest
      .spyOn(fetch, 'fetchJson')
      .mockResolvedValue(osm(node));

    const feature = await fetchFeature('n123');
    expect(fetchJson).toHaveBeenCalledTimes(1);
    expect(feature).toEqual(nodeFeature);
  });

  it('should work for way', async () => {
    const fetchJson = jest
      .spyOn(fetch, 'fetchJson')
      .mockImplementation((url) =>
        Promise.resolve(url.match(/overpass/) ? overpass : osm(way)),
      );

    const feature = await fetchFeature('w51050330');
    expect(fetchJson).toHaveBeenCalledTimes(2);
    expect(feature).toEqual(wayFeature);
  });

  it('should work for relation', async () => {
    const fetchJson = jest
      .spyOn(fetch, 'fetchJson')
      .mockImplementation((url) =>
        Promise.resolve(url.match(/overpass/) ? overpass : osm(relation)),
      );

    const feature = await fetchFeature('r1234');
    expect(fetchJson).toHaveBeenCalledTimes(2);
    expect(feature).toEqual(relationFeature);
  });

  it('should return some fetched routes', async () => {
    const features = await requestLines('node', 3862767512);

    features.forEach((feature) => {
      expect(feature).toHaveProperty('ref');
      expect(feature.ref).not.toBe('');
      expect(feature.ref).toEqual(expect.any(String));
      expect(feature).toHaveProperty('colour');
      expect(
        typeof feature.colour === 'string' || feature.colour === undefined,
      ).toBeTruthy();
    });
  });

  it('should return cached center for a way in BROWSER', async () => {
    isBrowser.mockReturnValue(true);
    isServer.mockReturnValue(false);
    addFeatureCenterToCache('w51050330', [123, 456]);

    const fetchJson = jest
      .spyOn(fetch, 'fetchJson')
      .mockImplementation((url) =>
        Promise.resolve(url.match(/overpass/) ? overpass : osm(way)),
      );

    const feature = await fetchFeature('w51050330');
    expect(fetchJson).toHaveBeenCalledTimes(1);
    expect(feature).toMatchObject({ ...wayFeature, center: [123, 456] });
  });
});
