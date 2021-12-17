/*
 *    Copyright [2015] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { $assert } from '@wisemapping/core-js';
import { PersistenceManager, Designer, LocalStorageManager, Menu } from '../../../../src/';
import * as mindplot from '../../../../src/';
import { $msg } from '../../../../src/components/Messages';

import $notifyModal from '../../../../src/components/widget/ModalDialogNotifier';

import $ from 'jquery';
global.jQuery = $;
global.$ = $;

let designer = null;

/*
 * Disclaimer: this global variable is a temporary workaround to Mootools' Browser class
 * We need to avoid browser detection and replace it with feature detection,
 * jquery recommends: http://www.modernizr.com/
 */

global.Browser = {
    firefox: window.globalStorage,
    ie: document.all && !window.opera,
    ie6: !window.XMLHttpRequest,
    ie7: document.all && window.XMLHttpRequest && !XDomainRequest && !window.opera,
    ie8: document.documentMode == 8,
    ie11: document.documentMode == 11,
    opera: Boolean(window.opera),
    chrome: Boolean(window.chrome),
    safari: window.getComputedStyle && !window.globalStorage && !window.opera,
    Platform: {
        mac: navigator.platform.indexOf('Mac') != -1,
    },
};

export function buildDesigner(options) {
    const container = $(`#${options.container}`);
    $assert(container, 'container could not be null');

    // Register load events ...
    designer = new Designer(options, container);
    designer.addEvent('loadSuccess', () => {
        window.mindmapLoadReady = true;
        console.log('Map loadded successfully');
    });

    const onerrorFn = function onerror(message, url, lineNo) {
        // Ignore errors ...
        if (message === 'Script error.' && lineNo == 0) {
            // http://stackoverflow.com/questions/5913978/cryptic-script-error-reported-in-javascript-in-chrome-and-firefox
            return;
        }

        // Transform error ...
        let errorMsg = message;
        if (typeof message === 'object' && message.srcElement && message.target) {
            if (
                message.srcElement == '[object HTMLScriptElement]' &&
                message.target == '[object HTMLScriptElement]'
            ) {
                errorMsg = 'Error loading script';
            } else {
                errorMsg = `Event Error - target:${message.target} srcElement:${message.srcElement}`;
            }
        }
        errorMsg = errorMsg.toString();

        // Close loading dialog ...
        if (window.waitDialog) {
            window.waitDialog.close();
            window.waitDialog = null;
        }

        // Open error dialog only in case of mindmap loading errors. The rest of the error are reported but not display the dialog.
        // Remove this in the near future.
        if (!window.mindmapLoadReady) {
            $notifyModal($msg('UNEXPECTED_ERROR_LOADING'));
        }

        console.error(errorMsg, 'line:', lineNo, 'url:', url);
    };

    window.onerror = onerrorFn;

    // Configure default persistence manager ...
    let persistence;
    if (options.persistenceManager) {
        if (typeof options.persistenceManager === 'string') {
            const managerClass = /^mindplot\.(\w+)/.exec(options.persistenceManager);
            if (managerClass) {
                persistence = new mindplot[managerClass[1]]('samples/{id}.xml');
            } else {
                persistence = eval(`new ${options.persistenceManager}()`);
            }
        } else {
            persistence = options.persistenceManager;
        }
    } else {
        persistence = new LocalStorageManager('samples/{id}.xml');
    }
    PersistenceManager.init(persistence);

    // Register toolbar event ...
    if ($('#toolbar').length) {
        const menu = new Menu(designer, 'toolbar', options.mapId, '');

        //  If a node has focus, focus can be move to another node using the keys.
        designer._cleanScreen = function () {
            menu.clear();
        };
    }

    return designer;
}

export async function loadDesignerOptions(jsonConf) {
    // Load map options ...
    let result;
    if (jsonConf) {
        result = await $.ajax({
            url: jsonConf,
            dataType: 'json',
            method: 'get',
        });
    } else {
        // Set workspace screen size as default. In this way, resize issues are solved.
        const containerSize = {
            height: parseInt(screen.height),
            width: parseInt(screen.width),
        };

        const viewPort = {
            height: parseInt(window.innerHeight - 70), // Footer and Header
            width: parseInt(window.innerWidth),
        };
        result = {
            readOnly: false,
            zoom: 0.85,
            saveOnLoad: true,
            size: containerSize,
            viewPort,
            container: 'mindplot',
            locale: 'en',
        };
    }
    return result;
}

export function loadExample(exampleFn) {
    $(() => {
        // Hack: load bootstrap first
        import('@libraries/bootstrap').then(exampleFn);
    });
}