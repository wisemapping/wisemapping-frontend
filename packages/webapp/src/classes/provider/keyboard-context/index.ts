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
import { createContext, useCallback, useMemo, useState } from 'react';

export type KetboardConfig = {
  hotkeysEnabled: boolean;
};

type KeyboardContextType = {
  hotkeyEnabled: boolean;
  /**
   * Disables the hotkeys until the returned release is called. Holds nest (e.g. two open
   * dialogs): the hotkeys come back only once every holder has released.
   */
  disableHotkeys: () => () => void;
};

// Hack to prevent error in the initialization. Needs more reseach ...
export const KeyboardContext = createContext<KeyboardContextType>({
  hotkeyEnabled: true,
  disableHotkeys: () => () => {},
});

/** The KeyboardContext value: counts the holds that keep the hotkeys disabled. */
export const useKeyboardContextValue = (): KeyboardContextType => {
  const [holds, setHolds] = useState(0);

  const disableHotkeys = useCallback(() => {
    setHolds((count) => count + 1);
    let released = false;
    return () => {
      if (!released) {
        released = true;
        setHolds((count) => count - 1);
      }
    };
  }, []);

  return useMemo(() => ({ hotkeyEnabled: holds === 0, disableHotkeys }), [holds, disableHotkeys]);
};
