import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemProps,
  ListItemText,
  Typography,
} from '@material-ui/core';
import {
  PanelFooter,
  PanelScrollbars,
  PanelWrapper,
} from '../utils/PanelHelpers';
import { useFeatureContext } from '../utils/FeatureContext';
import { ClosePanelButton } from '../utils/ClosePanelButton';
import { presets } from '../../services/tagging/data';
import { EditIconButton } from '../FeaturePanel/helpers/EditIconButton';
import { getPresetTranslation } from '../../services/tagging/translations';

const Heading = styled.div`
  font-size: 36px;
  line-height: 0.98;
  color: ${({ theme }) => theme.palette.text.panelHeading};
  position: relative;
  padding: 30px 0;
  ${({ deleted }) => deleted && 'text-decoration: line-through;'}

  &:hover .show-on-hover {
    display: block !important;
  }
`;

export const Content = styled.div`
  padding: 20px 2em 0 2em;

  a.maptiler {
    display: block;
    color: inherit;
    text-align: center;
    margin: 1em 0;

    strong {
      color: ${({ theme }) => theme.palette.link};
      font-weight: normal;
    }

    &:hover {
      text-decoration: none;

      & strong {
        text-decoration: underline;
      }
    }
  }
`;

function ListItemLink(props: ListItemProps<'a', { button?: true }>) {
  return <ListItem button component="a" {...props} />;
}

export const CategoryPanel = () => {
  const router = useRouter();
  const preset = presets[router.query.key?.join('/')];
  if (!preset) {
    return null;
  }

  const { presetKey, name } = preset;
  const heading = getPresetTranslation(presetKey) ?? name ?? presetKey;

  return (
    <PanelWrapper>
      <PanelScrollbars>
        <ClosePanelButton right onClick={() => {}} />
        <Content>
          <Typography variant="h5" gutterBottom mt={5}>
            Hledání: {heading}
          </Typography>
        </Content>

        <List component="nav" aria-label="main mailbox folders">
          <ListItemLink href="/asdf">
            <ListItemIcon>AA</ListItemIcon>
            <ListItemText primary="Inbox" />
          </ListItemLink>
        </List>

        <PanelFooter />
      </PanelScrollbars>
    </PanelWrapper>
  );
};
