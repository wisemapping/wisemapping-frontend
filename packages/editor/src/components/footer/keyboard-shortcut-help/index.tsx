import { $msg } from '@wisemapping/mindplot';
import React from 'react';

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
