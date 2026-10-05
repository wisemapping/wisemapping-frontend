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

/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import { addMatchImageSnapshotCommand } from '@simonsmith/cypress-image-snapshot/command';

declare global {
  /** A viewport (client) coordinate of the application under test. */
  type PointerPosition = { clientX: number; clientY: number };

  type PointerDragOptions = {
    /**
     * Fire the mousedown at this element instead of at the element under `from`: for a handle
     * that another element covers (as `force: true` does for cy.trigger()).
     */
    pressOn?: Element;
  };

  namespace Cypress {
    interface Chainable {
      waitForLoad(): void;
      waitEditorLoaded(): void;
      focusTopicByText(value: string): void;
      focusTopicById(id: number): void;

      onMouseOverToolbarButton(
        value:
          'Style Topic & Connections' | 'Font Style' | 'Connection Style' | 'Relationship Style',
      ): void;
      onClickToolbarButton(
        value:
          | 'Add Relationship'
          | 'Add Icon'
          | 'Add Link'
          | 'Add Note'
          | 'Add Topic Image'
          | 'Theme'
          | 'Connection Style'
          | 'Relationship Style'
          | 'Font Style'
          | 'Style Topic & Connections',
      ): void;

      triggerUndo(): void;
      triggerRedo(): void;
      getEmoji(): Chainable<JQuery<HTMLElement>>;
      pointerDrag(from: PointerPosition, to: PointerPosition, options?: PointerDragOptions): void;
      waitForEmojiTab(): void;
      waitForIconsGalleryTab(): void;
    }
  }
}

// Visual regression (see cypress/plugins/index.ts and the "Image-snapshot tests" section of CLAUDE.md).
// Baselines live in cypress/snapshots/<spec>/<name>.snap.png and are rendered natively on macOS
// (headless Chrome). A snapshot fails when more than 10 pixels differ: two native runs differed
// in 3 of 128 snapshots, by 2 px each, so this only leaves room for isolated anti-aliasing
// pixels; a moved line, a colour change or a text change is far above it.
const snapshotDefaults = {
  failureThreshold: 10,
  failureThresholdType: 'pixel' as const,
  // Per-pixel colour distance (pixelmatch YIQ, 0..1) below which two pixels count as equal.
  // 0.01 (the jest-image-snapshot default) flags a darker shade of the same hue; 0.1 does not.
  customDiffConfig: { threshold: 0.01 },
  capture: 'fullPage' as const,
  // The emoji-picker-react grid (third-party) lands on a different sub-pixel scroll offset
  // after a pick from run to run; black it out instead of comparing it.
  blackout: ['.epr-body'],
  // Full-page captures of the largest maps (huge2) take a while.
  timeout: 180000,
};
addMatchImageSnapshotCommand(snapshotDefaults);

const FREEZE_STYLE_ID = 'cypress-visual-freeze';
// Hover tooltips open after a timer, so whether one is on screen at capture time is a race. The
// ripple of the last click is frozen mid-animation, at a size that differs from run to run.
const FREEZE_CSS = `*, *::before, *::after {
  transition: none !important;
  animation: none !important;
  caret-color: transparent !important;
  scroll-behavior: auto !important;
}
.MuiTooltip-popper {
  visibility: hidden !important;
}
.MuiTouchRipple-root {
  display: none !important;
}`;

// Signature of the rendered page: the markup, including open shadow roots (the mindplot
// canvas and the emoji picker live in one), plus every non-zero scroll offset, so that a
// smooth scroll still in progress (e.g. the emoji picker list) counts as a change.
const collectSignature = (root: Document | ShadowRoot, parts: string[]): void => {
  root.querySelectorAll('*').forEach((el) => {
    if (el.scrollTop || el.scrollLeft) {
      parts.push(`${el.scrollTop},${el.scrollLeft}`);
    }
    if (el.shadowRoot) {
      parts.push(el.shadowRoot.innerHTML);
      collectSignature(el.shadowRoot, parts);
    }
  });
};

const pageMarkup = (doc: Document): string => {
  const parts = [doc.body.innerHTML];
  collectSignature(doc, parts);
  return parts.join('\n');
};

// Waits until the page markup stops changing (topics laid out, panels mounted). Gives up
// quietly after ~10 s, so a page with a live element (a timer, a spinner) is still captured.
const waitForStablePage = (previous = '', stableChecks = 0, attempts = 0): void => {
  cy.document({ log: false }).then((doc) => {
    const markup = pageMarkup(doc);
    const settled = markup === previous ? stableChecks + 1 : 0;
    if (settled >= 2) {
      return;
    }
    if (attempts > 60) {
      Cypress.log({
        name: 'matchImageSnapshot',
        message: 'page markup did not settle, capturing anyway',
      });
      return;
    }
    cy.wait(150, { log: false });
    waitForStablePage(markup, settled, attempts + 1);
  });
};

// Make every snapshot wait for a stable frame: the map loaded (the MUI loading skeleton is
// gone) and its markup settled, web fonts loaded, CSS transitions and animations (MUI fades,
// ripples, the caret) at their end state, hover tooltips hidden, and two animation frames painted.
Cypress.Commands.overwrite('matchImageSnapshot', (originalFn, subject, ...args) => {
  cy.get('.MuiSkeleton-root', { log: false, timeout: 240000 }).should('not.exist');
  cy.document({ log: false }).then((doc) => {
    if (!doc.getElementById(FREEZE_STYLE_ID)) {
      const style = doc.createElement('style');
      style.id = FREEZE_STYLE_ID;
      style.textContent = FREEZE_CSS;
      doc.head.appendChild(style);
    }
  });
  waitForStablePage();
  cy.document({ log: false }).its('fonts.status', { log: false }).should('equal', 'loaded');
  cy.window({ log: false }).then(
    (win) =>
      new Cypress.Promise<void>((resolve) => {
        win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
      }),
  );
  return originalFn(subject, ...args).then(() => {
    cy.document({ log: false }).then((doc) => doc.getElementById(FREEZE_STYLE_ID)?.remove());
  });
});

Cypress.Commands.add('waitEditorLoaded', () => {
  // Wait for loading spinner to disappear
  cy.get('[aria-label="vortex-loading"]', { timeout: 120000 }).should('not.exist');

  // Wait for SVG canvas to be visible
  cy.get('svg > path', { timeout: 30000 }).should('be.visible');

  // Wait for central topic to be rendered (ensures mindmap is initialized)
  // Look for any rect element in the SVG (more flexible than specific path)
  cy.get('svg rect', { timeout: 10000 }).should('exist');

  // Wait for fonts to load
  cy.document().its('fonts.status').should('equal', 'loaded');

  // Wait for at least one toolbar button to be enabled (ensures Designer is ready)
  // Check visualization toolbar buttons (zoom, outline, expand/collapse)
  cy.get('button[aria-label*="Zoom"]', { timeout: 10000 }).first().should('not.be.disabled');

  // Clear local storage after everything is loaded
  cy.clearLocalStorage('welcome-xml');
});

Cypress.Commands.add('waitForLoad', () => {
  cy.document().its('fonts.status').should('equal', 'loaded');
});

// Mindmap commands ...
Cypress.Commands.add('focusTopicById', (id: number) => {
  cy.get(`[test-id=${id}]`).click({ force: true });
});

Cypress.Commands.add('focusTopicByText', (text: string) => {
  cy.contains(text).click({ force: true });
});

Cypress.Commands.add(
  'onMouseOverToolbarButton',
  (
    button: 'Style Topic & Connections' | 'Font Style' | 'Connection Style' | 'Relationship Style',
  ) => {
    // For buttons with custom panels (like Style Topic & Connections), we need to click instead of hover
    // because the toolbar requires click-to-open for items with custom render
    cy.get(`[aria-label="${button}"]`).first().click({ force: true });

    // Wait for the panel to be visible and fully rendered
    // For Style Topic & Connections, wait for one of the tab labels to appear
    if (button === 'Style Topic & Connections') {
      cy.contains('Shape', { timeout: 5000 }).should('be.visible');
    }

    // Wait for panel content to be fully rendered and interactive
    cy.get('body').should('not.have.class', 'loading');
  },
);

Cypress.Commands.add(
  'onClickToolbarButton',
  (
    button:
      | 'Add Relationship'
      | 'Add Icon'
      | 'Add Link'
      | 'Add Note'
      | 'Add Topic Image'
      | 'Theme'
      | 'Connection Style'
      | 'Relationship Style'
      | 'Font Style',
  ) => {
    // Use contains selector for buttons that include keyboard shortcuts in their aria-label
    cy.get(`[aria-label*="${button}"]`).click({ multiple: true, force: true });
  },
);

Cypress.Commands.add('triggerUndo', () => {
  cy.get('[aria-label^="Undo ').eq(1).click();
});

Cypress.Commands.add('triggerRedo', () => {
  cy.get('[aria-label^="Redo ').eq(1).click();
});

// The element a real pointer at (clientX, clientY) would hit, looking inside open shadow roots
// (the mindplot canvas lives in the shadow root of <mindplot-component>).
const elementUnderPointer = (doc: Document, { clientX, clientY }: PointerPosition): Element => {
  let target = doc.elementFromPoint(clientX, clientY);
  while (target?.shadowRoot) {
    const inner = target.shadowRoot.elementFromPoint(clientX, clientY);
    if (!inner || inner === target) {
      break;
    }
    target = inner;
  }
  return target ?? doc.body;
};

const dispatchPointerEvent = (
  win: Cypress.AUTWindow,
  type: 'mousedown' | 'mousemove' | 'mouseup',
  position: PointerPosition,
  target: Element = elementUnderPointer(win.document, position),
): void => {
  target.dispatchEvent(
    new win.MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      // Events from a real pointer are composed: they cross the shadow root and reach the document.
      composed: true,
      view: win,
      clientX: position.clientX,
      clientY: position.clientY,
      button: 0,
      buttons: type === 'mouseup' ? 0 : 1,
    }),
  );
};

/**
 * Drags with the left button the way a real pointer does: mousedown on the element under `from`,
 * a few mousemoves on the way to `to`, and the mouseup on the element under `to`. Each event is a
 * bubbling, composed MouseEvent fired at the element under the pointer (see `options.pressOn`).
 *
 * Do not use `cy.get('body').trigger('mousemove')` for drags: trigger() dispatches a plain,
 * non-composed Event at the element in the middle of the body, which here is inside the mindplot
 * shadow root, so it never reaches the drag listeners on the document.
 */
Cypress.Commands.add(
  'pointerDrag',
  (from: PointerPosition, to: PointerPosition, options: PointerDragOptions = {}) => {
    cy.window({ log: false }).then((win) => {
      Cypress.log({
        name: 'pointerDrag',
        message: `(${from.clientX}, ${from.clientY}) -> (${to.clientX}, ${to.clientY})`,
      });
      dispatchPointerEvent(win, 'mousedown', from, options.pressOn);
      const steps = 4;
      for (let step = 1; step <= steps; step++) {
        dispatchPointerEvent(win, 'mousemove', {
          clientX: from.clientX + ((to.clientX - from.clientX) * step) / steps,
          clientY: from.clientY + ((to.clientY - from.clientY) * step) / steps,
        });
      }
      dispatchPointerEvent(win, 'mouseup', to);
    });
  },
);

Cypress.Commands.add('getEmoji', () => {
  return cy.get('button.epr-emoji:visible');
});

Cypress.Commands.add('waitForEmojiTab', () => {
  cy.contains('Emojis').should('be.visible');
  cy.getEmoji().first().should('be.visible');
});

Cypress.Commands.add('waitForIconsGalleryTab', () => {
  cy.contains('Icons Gallery').should('be.visible');
  cy.get('img').should('have.length.gt', 0);
  cy.get('img').first().should('have.attr', 'src').and('not.be.empty');
});
