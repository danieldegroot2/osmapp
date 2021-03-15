// @flow

import * as React from 'react';
import maplibregl from 'maplibre-gl'; // update CSS import in _document.js
import { getSkeleton } from './helpers';
import { fetchFromApi } from '../../services/osmApi';
import { setUpHover, style } from './layers';
import { useMapEffectFactory } from '../helpers';
import { useMapStateContext } from '../utils/MapStateContext';
import { throttle } from 'lodash';
import { getShortId } from '../../services/helpers';

// mapboxgl.accessToken = 'pk.eyJ1IjoiemJ5Y3oiLCJhIjoiY2oxMGN4enAxMDAyZjMybXF5eGJ5M2lheCJ9.qjvbRJ2C1tL4O9g9jOdJIw';
const geolocateControl = new maplibregl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
  },
  trackUserLocation: true,
});
const scaleControl = new maplibregl.ScaleControl({
  maxWidth: 80,
  unit: window.localStorage.getItem('units') ? 'imperial' : 'metric',
});

const useInitMap = () => {
  const mapRef = React.useRef(null);
  const [mapInState, setMapInState] = React.useState(null);

  React.useEffect(() => {
    if (!mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style,
      attributionControl: false,
    });
    setMapInState(map);

    map.addControl(geolocateControl);
    map.addControl(scaleControl);
    setUpHover(map);
  }, [mapRef]);

  return [mapInState, mapRef];
};

const useOnFeatureClicked = useMapEffectFactory((map, onFeatureClicked) => {
  map.on('click', async e => {
    const point = e.point;
    const coords = map.unproject(point).toArray();
    const features = map.queryRenderedFeatures(point);
    if (!features.length) {
      return;
    }

    const skeleton = getSkeleton(features[0], coords);
    console.log(`clicked skeleton: `, skeleton); // eslint-disable-line no-console

    if (skeleton.nonOsmObject) {
      onFeatureClicked(skeleton);
    } else {
      onFeatureClicked({ ...skeleton, loading: true });
      const fullFeature = await fetchFromApi(skeleton.osmMeta);
      if (getShortId(fullFeature.osmMeta) === getShortId(skeleton.osmMeta)) {
        onFeatureClicked(fullFeature);
      }
    }
  });
});

const useOnMapLoaded = useMapEffectFactory((map, onMapLoaded) => {
  map.on('load', onMapLoaded);
});

const useUpdateViewOnMove = useMapEffectFactory(
  (map, _setViewFromMap, setBbox) => {
    map.on(
      'move',
      throttle(() => {
        _setViewFromMap([
          map.getZoom().toFixed(2),
          map.getCenter().lat.toFixed(4),
          map.getCenter().lng.toFixed(4),
        ]);

        const b = map.getBounds();
        //<lon x1>,<lat y1>,<x2>,<y2>
        const bb = [b.getWest(), b.getNorth(), b.getEast(), b.getSouth()];
        setBbox(bb.map(x => x.toFixed(5)));
      }, 2000),
    );
  },
);

const useUpdateMap = useMapEffectFactory((map, _viewForMap) => {
  const center = [_viewForMap[2], _viewForMap[1]];
  console.log('map to jump to:', center);
  map.jumpTo({ center, zoom: _viewForMap[0] });
});

const BrowserMap = ({ onFeatureClicked, onMapLoaded }) => {
  const [map, mapRef] = useInitMap();
  useOnFeatureClicked(map, onFeatureClicked);
  useOnMapLoaded(map, onMapLoaded);

  const { _viewForMap, _setViewFromMap, setBbox } = useMapStateContext();
  useUpdateViewOnMove(map, _setViewFromMap, setBbox);
  useUpdateMap(map, _viewForMap);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default BrowserMap;