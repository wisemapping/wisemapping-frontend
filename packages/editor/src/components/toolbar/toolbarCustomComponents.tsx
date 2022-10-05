import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { $msg, DesignerKeyboard, ImageIcon } from '@wisemapping/mindplot';

import { CirclePicker as ReactColorPicker } from 'react-color';
import { NodePropertyValueModel } from './ToolbarValueModelBuilder';
import iconGroups from './iconGroups.json';
import colors from './colors.json';
import Link from '@mui/material/Link';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ToolbarMenuItem } from './Toolbar';
import { ToolbarOptionConfiguration } from './ToolbarOptionConfigurationInterface';

/**
 * Color picker for toolbar
 */
export const ColorPicker = (props: {
  closeModal: () => void;
  colorModel: NodePropertyValueModel;
}) => {
  return (
    <Box component="div" sx={{ m: 2 }}>
      <ReactColorPicker
        color={props.colorModel.getValue() || '#fff'}
        onChangeComplete={(color) => {
          props.colorModel.setValue(color.hex);
          props.closeModal();
        }}
        colors={colors}
        width={216}
        circleSpacing={9}
        circleSize={18}
      ></ReactColorPicker>
    </Box>
  );
};

/**
 * checks whether the input is a valid url
 * @return {Boolean} true if the url is valid
 */
function checkURL(url: string): boolean {
  const regex =
    /^((http|https):\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
  return regex.test(url);
}

const SaveAndDelete = (props: {
  model: NodePropertyValueModel;
  closeModal: () => void;
  submitHandler: () => void;
}) => {
  return (
    <Box component="span">
      <IconButton
        onClick={() => {
          props.closeModal();
          props.model.setValue(undefined);
        }}
      >
        <DeleteOutlineOutlinedIcon />
      </IconButton>
      <Button color="primary" variant="outlined" onClick={props.submitHandler} sx={{ mr: 1 }}>
        {$msg('ACCEPT')}
      </Button>
      <Button color="primary" variant="contained" onClick={props.closeModal}>
        {$msg('CANCEL')}
      </Button>
    </Box>
  );
};

/**
 * Url form for toolbar and node contextual editor
 */
export const UrlForm = (props: { closeModal: () => void; urlModel: NodePropertyValueModel }) => {
  const [url, setUrl] = useState(props.urlModel.getValue());

  /**
   * if url is valid set model value and calls closeModal
   */
  const submitHandler = () => {
    if (checkURL(url)) {
      props.closeModal();
      props.urlModel.setValue(url);
    }
  };

  const keyDownHandler = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitHandler();
    }
  };

  const isValidUrl = !url || checkURL(url);
  return (
    <Box display="flex" sx={{ p: 1 }}>
      <Input
        autoFocus
        error={!isValidUrl}
        helperText={isValidUrl ? '' : $msg('URL_ERROR')}
        placeholder={$msg('PASTE_URL_HERE')}
        label="URL"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        variant="outlined"
        size="small"
        onKeyDown={keyDownHandler}
        InputProps={{
          endAdornment: (
            <Link href={isValidUrl ? url : ''} target="_blank">
              <IconButton disabled={!isValidUrl}>
                <OpenInNewOutlinedIcon></OpenInNewOutlinedIcon>
              </IconButton>
            </Link>
          ),
        }}
        sx={{ pr: 1 }}
      ></Input>
      <SaveAndDelete
        model={props.urlModel}
        closeModal={props.closeModal}
        submitHandler={submitHandler}
      />
    </Box>
  );
};

/**
 *
 * @param props text field props.
 * @returns wrapped mui TextField, that disable mindplot keyboard events on focus and enable it on blur
 */
const Input = (props: TextFieldProps) => {
  useEffect(() => {
    return () => DesignerKeyboard.resume();
  }, []);
  return (
    <TextField
      {...props}
      onFocus={(e) => {
        DesignerKeyboard.pause();
        props.onFocus && props.onFocus(e);
      }}
      onBlur={(e) => {
        DesignerKeyboard.resume();
        props.onBlur && props.onBlur(e);
      }}
    ></TextField>
  );
};

/**
 * Note form for toolbar and node contextual editor
 */
export const NoteForm = (props: {
  closeModal: () => void;
  noteModel: NodePropertyValueModel | null;
}) => {
  const [note, setNote] = useState(props.noteModel.getValue());

  const submitHandler = () => {
    props.closeModal();
    props.noteModel.setValue(note);
  };

  return (
    <Box sx={{ p: 2, width: '300px' }}>
      <Input
        autoFocus
        multiline
        label={$msg('NOTE')}
        variant="outlined"
        fullWidth
        rows={12}
        margin="dense"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      ></Input>
      <br />
      <SaveAndDelete
        model={props.noteModel}
        closeModal={props.closeModal}
        submitHandler={submitHandler}
      />
    </Box>
  );
};

/**
 * Font family selector for editor toolbar
 */
export function FontFamilySelect(props: { fontFamilyModel: NodePropertyValueModel }) {
  const [font, setFont] = React.useState(props.fontFamilyModel.getValue());

  const handleChange = (event: SelectChangeEvent) => {
    setFont(event.target.value as string);
    props.fontFamilyModel.setValue(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl variant="standard" sx={{ m: 1, minWidth: 220 }} size="small">
        <Select id="demo-simple-select" value={font || ''} onChange={handleChange}>
          {[
            'Arial',
            'Baskerville',
            'Tahoma',
            'Limunari',
            'Brush Script MT',
            'Verdana',
            'Times',
            'Cursive',
            'Fantasy',
            'Perpetua',
            'Brush Script',
            'Copperplate',
          ]
            .sort()
            .map((f) => (
              <MenuItem value={f} key={f}>
                <Typography fontFamily={f}>{f}</Typography>
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
}

/**
 * tab panel used for display icon families in tabs
 */
function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
/**
 * emoji picker for editor toolbar
 */
export const ToolbarEmojiPcker = (props: {
  closeModal: () => void;
  iconModel: NodePropertyValueModel;
}) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '250px' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="fullWidth" value={value} onChange={handleChange} aria-label="Icons tabs">
          {iconGroups.map((family, i) => (
            <Tab
              key={family.id}
              icon={<img className="panelIcon" src={ImageIcon.getImageUrl(family.icons[0])} />}
              {...a11yProps(i)}
            />
          ))}
        </Tabs>
      </Box>
      {iconGroups.map((family, i) => (
        <TabPanel key={family.id} value={value} index={i}>
          {family.icons.map((icon) => (
            <img
              className="panelIcon"
              key={icon}
              src={ImageIcon.getImageUrl(icon)}
              onClick={() => {
                props.iconModel.setValue(icon);
                props.closeModal();
              }}
            ></img>
          ))}
        </TabPanel>
      ))}
    </Box>
  );
};

export const UndoAndRedoButton = (props: {
  configuration: ToolbarOptionConfiguration;
  disabledCondition: (event) => boolean;
}) => {
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    const handleUpdate: any = (event) => {
      if (props.disabledCondition(event)) {
        setDisabled(false);
      } else {
        setDisabled(true);
      }
    };
    designer.addEvent('modelUpdate', handleUpdate);
    return () => {
      designer.removeEvent('modelUpdate', handleUpdate);
    };
  }, []);

  return (
    <ToolbarMenuItem
      configuration={{
        ...props.configuration,
        disabled: () => disabled,
      }}
    ></ToolbarMenuItem>
  );
};

export const KeyboardShorcutsHelp = () => {
  return (
    <div id="keyboardTable" style={{ position: 'relative', zIndex: '2' }}>
      <table>
        <colgroup>
          <col width="40%" />
          <col width="30%" />
          <col width="30%" />
        </colgroup>
        <thead>
          <tr>
            <th>{$msg('ACTION')}</th>
            <th>Windows - Linux</th>
            <th>Mac OS X</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{$msg('SAVE_CHANGES')}</td>
            <td>{$msg('CTRL')} + S</td>
            <td>⌘ + S</td>
          </tr>
          <tr>
            <td>{$msg('CREATE_SIBLING_TOPIC')}</td>
            <td>Enter</td>
            <td>Enter</td>
          </tr>
          <tr>
            <td>{$msg('CREATE_CHILD_TOPIC')}</td>
            <td>{$msg('K_INSERT')} / Tab</td>
            <td>⌘ + Enter / Tab</td>
          </tr>
          <tr>
            <td>{$msg('DELETE_TOPIC')}</td>
            <td>{$msg('K_DELETE')}</td>
            <td>Delete</td>
          </tr>
          <tr>
            <td>{$msg('EDIT_TOPIC_TEXT')}</td>
            <td>{$msg('JUST_START_TYPING')} | F2</td>
            <td>{$msg('JUST_START_TYPING')} | F2</td>
          </tr>
          <tr>
            <td>{$msg('MULTIPLE_LINES')}</td>
            <td>{$msg('CTRL')} + Enter</td>
            <td>⌘ + Enter</td>
          </tr>
          <tr>
            <td>{$msg('COPY_AND_PASTE_TOPICS')}</td>
            <td>
              {$msg('CTRL')} + C / {$msg('CTRL')} + V
            </td>
            <td>⌘ + C / ⌘ + V</td>
          </tr>

          <tr>
            <td>{$msg('COLLAPSE_CHILDREN')}</td>
            <td>{$msg('SPACE_BAR')}</td>
            <td>{$msg('SPACE_BAR')}</td>
          </tr>
          <tr>
            <td>{$msg('TOPIC_NAVIGATION')}</td>
            <td>{$msg('ARROW_KEYS')}</td>
            <td>{$msg('ARROW_KEYS')}</td>
          </tr>
          <tr>
            <td>{$msg('SELECT_MULTIPLE_NODES')}</td>
            <td>
              {$msg('CTRL')} + {$msg('MOUSE_CLICK')}
            </td>
            <td>
              {$msg('CTRL')} + {$msg('MOUSE_CLICK')}
            </td>
          </tr>
          <tr>
            <td>{$msg('UNDO_EDITION')}</td>
            <td>{$msg('CTRL')} + Z</td>
            <td>⌘ + Z</td>
          </tr>
          <tr>
            <td>{$msg('REDO_EDITION')}</td>
            <td>{$msg('CTRL')} + Shift + Z</td>
            <td>⌘ + Shift + Z</td>
          </tr>
          <tr>
            <td>{$msg('SELECT_ALL_TOPIC')}</td>
            <td>{$msg('CTRL')} + A</td>
            <td>⌘ + A</td>
          </tr>
          <tr>
            <td>{$msg('CANCEL_TEXT_CHANGES')}</td>
            <td>Esc</td>
            <td>Esc</td>
          </tr>
          <tr>
            <td>{$msg('DESELECT_ALL_TOPIC')}</td>
            <td>{$msg('CTRL')} + Shift + A</td>
            <td>⌘ + Shift + A</td>
          </tr>
          <tr>
            <td>{$msg('CHANGE_TEXT_ITALIC')}</td>
            <td>{$msg('CTRL')} + I</td>
            <td>⌘ + I</td>
          </tr>
          <tr>
            <td>{$msg('CHANGE_TEXT_BOLD')}</td>
            <td>{$msg('CTRL')} + B</td>
            <td>⌘ + B</td>
          </tr>
          <tr>
            <td>{$msg('TOPIC_NOTE')}</td>
            <td>{$msg('CTRL')} + K</td>
            <td>⌘ + K</td>
          </tr>
          <tr>
            <td>{$msg('TOPIC_LINK')}</td>
            <td>{$msg('CTRL')} + L</td>
            <td>⌘ + L</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
