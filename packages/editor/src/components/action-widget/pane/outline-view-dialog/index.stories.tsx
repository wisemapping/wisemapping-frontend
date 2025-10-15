/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import OutlineViewDialog from './index';
import { Mindmap, XMLSerializerFactory } from '@wisemapping/mindplot';
import { IntlProvider } from 'react-intl';
import I18nMsg from '../../../../classes/i18n-msg';
import { Button, Box } from '@mui/material';

// Custom args interface for the story
interface StoryArgs {
  mapId: string;
}

const meta: Meta = {
  title: 'Editor/OutlineViewDialog',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    mapId: {
      control: 'select',
      options: [
        'welcome',
        'welcome-prism',
        'sample1',
        'sample2',
        'sample3',
        'sample4',
        'sample5',
        'sample6',
        'sample8',
        'img-support',
        'error-on-load',
        'complex',
        'huge',
        'icon-sample',
        'emoji',
        'connection-style',
      ],
      description: 'Select the mind map to display',
      defaultValue: 'welcome',
    },
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

// Helper function to dynamically import WXML files
const loadWXMLFile = async (mapId: string): Promise<string> => {
  try {
    // Use dynamic import to load the WXML file
    const module = await import(`../../../../../test/playground/map-render/samples/${mapId}.wxml`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load WXML file for ${mapId}:`, error);
    throw error;
  }
};

// Story component that loads WXML and shows only the dialog
const OutlineViewStory = ({ mapId = 'welcome' }: StoryArgs) => {
  const [mindmap, setMindmap] = useState<Mindmap | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const locale = 'en';
  const msg = I18nMsg.loadLocaleData(locale);

  useEffect(() => {
    const loadMindmap = async () => {
      setIsLoading(true);
      setError(undefined);
      try {
        // Load WXML file content
        const xmlContent = await loadWXMLFile(mapId);

        // Parse XML string to Document using DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          throw new Error(`XML Parse Error: ${parseError.textContent}`);
        }

        // Create serializer and load mindmap from DOM
        const serializer = XMLSerializerFactory.createFromDocument(xmlDoc);
        const loadedMindmap = serializer.loadFromDom(xmlDoc, mapId);

        setMindmap(loadedMindmap);
      } catch (err) {
        console.error('Failed to load mindmap:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setMindmap(undefined);
      } finally {
        setIsLoading(false);
      }
    };
    loadMindmap();
  }, [mapId]);

  if (isLoading) {
    return (
      <IntlProvider locale={locale} messages={msg}>
        <Box sx={{ padding: '20px', textAlign: 'center' }}>
          <div>Loading map: {mapId}...</div>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            disabled={true}
            sx={{ marginTop: 2 }}
          >
            Open Outline View
          </Button>
        </Box>
      </IntlProvider>
    );
  }

  if (error) {
    return (
      <IntlProvider locale={locale} messages={msg}>
        <Box sx={{ padding: '20px', color: 'red' }}>
          <div>
            <strong>Error loading {mapId}:</strong> {error}
          </div>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            disabled={true}
            sx={{ marginTop: 2 }}
          >
            Open Outline View
          </Button>
        </Box>
      </IntlProvider>
    );
  }

  return (
    <IntlProvider locale={locale} messages={msg}>
      <Box sx={{ padding: '20px', textAlign: 'center' }}>
        <div>
          Map loaded: <strong>{mindmap?.getCentralTopic()?.getText()}</strong>
        </div>
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ marginTop: 2 }}>
          Open Outline View
        </Button>

        <OutlineViewDialog open={open} onClose={() => setOpen(false)} mindmap={mindmap} />
      </Box>
    </IntlProvider>
  );
};

export const Default: Story = {
  args: {
    mapId: 'welcome',
  },
  render: (args) => <OutlineViewStory mapId={args.mapId} />,
};
