import * as React from 'react';
import styled from 'styled-components';
import { Scrollbars } from 'react-custom-scrollbars';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Share from '@material-ui/icons/Share';
import StarBorder from '@material-ui/icons/StarBorder';
import Directions from '@material-ui/icons/Directions';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import Head from 'next/head';
import Typography from '@material-ui/core/Typography';
import { Alert } from '@material-ui/lab';
import Property from './Property';
import FeatureHeading from './FeatureHeading';
import FeatureImage from './FeatureImage';
import Coordinates from './Coordinates';
import { capitalize, useBoolState, useToggleState } from '../helpers';
import { icons } from '../../assets/icons';
import TagsTable from './TagsTable';
import Maki from '../utils/Maki';
import { getShortId, getShortLink, getUrlOsmId } from '../../services/helpers';
import EditDialog from './EditDialog';
import { SHOW_PROTOTYPE_UI } from '../../config';

// custom scrollbar
// better: https://github.com/rommguy/react-custom-scroll
// maybe https://github.com/malte-wessel/react-custom-scrollbars (larger)
const Wrapper = styled.div`
  position: absolute;
  left: 0;
  top: 72px; // TopPanel
  bottom: 0;
  background-color: #fafafa;
  overflow: hidden;
  z-index: 1100;

  display: flex;
  flex-direction: column;

  width: 100%;
  @media (min-width: 410px) {
    width: 410px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 72px - 238px); // 100% - TopPanel - FeatureImage
  padding: 20px 15px 0 15px;
`;

const StyledEdit = styled.div`
  margin: 60px 0 20px 0;
  text-align: center;
`;

const Footer = styled.div`
  color: rgba(0, 0, 0, 0.54);
  margin-top: auto;
  padding-bottom: 15px;
  font-size: 1rem;
  line-height: 1.5;
`;

const Loading = styled.div`
  height: 0;
`;

const Spacer = styled.div`
  padding-bottom: 10px;
`;

const StyledIconButton = styled(IconButton)`
  svg {
    width: 20px;
    height: 20px;
    color: #fff;
  }
`;

const PoiType = styled.div`
  color: #fff;
  margin: 0 auto 0 15px;
  font-size: 13px;
  position: relative;
  width: 100%;
  svg {
    vertical-align: bottom;
  }
  span {
    position: absolute;
    left: 20px;
  }
`;

const featuredKeys = ['website', 'phone', 'opening_hours'];

const Panel = ({ feature }) => {
  const [advanced, toggleAdvanced] = useToggleState(false);
  const [open, handleOpen, handleClose] = useBoolState(false);

  const {
    loading,
    nonOsmObject,
    tags,
    layer,
    osmMeta,
    properties,
    skeleton,
    error,
  } = feature;

  const shortLink = getShortLink(osmMeta);
  const ico = icons.includes(properties.class)
    ? properties.class
    : 'information';
  const subclass = properties.subclass || (layer && layer.id) || '?';
  const featuredTags = featuredKeys
    .map((k) => [k, tags[k]])
    .filter((x) => x[1]);

  // TODO resolve all getPoiClass

  return (
    <Wrapper>
      {!nonOsmObject && (
        <Head>
          <title>{tags.name || subclass} · osmapp.org</title>
        </Head>
      )}
      <Scrollbars universal autoHide style={{ height: '100%' }}>
        <FeatureImage feature={feature} ico={ico}>
          <PoiType>
            <Maki ico={ico} />
            <span>{tags.name ? subclass : 'beze jména'}</span>
          </PoiType>

          {SHOW_PROTOTYPE_UI && (
            <>
              <StyledIconButton>
                <Share htmlColor="#fff" titleAccess="Sdílet" />
              </StyledIconButton>
              <StyledIconButton>
                <StarBorder htmlColor="#fff" titleAccess="Uložit" />
              </StyledIconButton>
              <StyledIconButton>
                <Directions htmlColor="#fff" titleAccess="Trasa" />
              </StyledIconButton>
            </>
          )}
        </FeatureImage>
        <Loading>{loading && <LinearProgress />}</Loading>
        <Content>
          <FeatureHeading title={tags.name || subclass} />

          {error === 'gone' && (
            <Alert variant="outlined" severity="warning">
              Tento prvek byl v mezičase smazán z OpenStreetMap.{' '}
              <a
                href={`https://osm.org/${getUrlOsmId(feature.osmMeta)}/history`}
              >
                Historie &raquo;
              </a>
            </Alert>
          )}

          {!advanced && !!featuredTags.length && (
            <>
              {featuredTags.map(([k, v]) => (
                <Property key={k} k={k} v={v} />
              ))}
              <Spacer />

              <Typography
                variant="overline"
                display="block"
                color="textSecondary"
              >
                Další informace
              </Typography>
            </>
          )}

          <TagsTable
            tags={tags}
            except={advanced ? [] : ['name', 'layer', ...featuredKeys]}
          />

          {!skeleton && (
            <StyledEdit>
              <Button
                size="large"
                title="Upravit místo v živé databázi OSM"
                startIcon={<EditIcon />}
                variant="outlined"
                color="primary"
                onClick={handleOpen}
              >
                Upravit místo
              </Button>
            </StyledEdit>
          )}

          <EditDialog
            open={open}
            handleClose={handleClose}
            feature={feature}
            key={getShortId(feature.osmMeta) + (skeleton && 'skel')}
          />

          <Footer>
            {nonOsmObject
              ? `Mapový prvek ${osmMeta.type}`
              : `${capitalize(osmMeta.type)} v databázi OpenStreetMap`}
            <br />
            <Coordinates feature={feature} />
            <br />
            {!nonOsmObject && <a href={shortLink}>{shortLink}</a>}
            <br />
            <label>
              <input
                type="checkbox"
                onChange={toggleAdvanced}
                checked={advanced}
              />{' '}
              Zobrazit jen tagy
            </label>
          </Footer>
        </Content>
      </Scrollbars>
    </Wrapper>
  );
};

export default Panel;
