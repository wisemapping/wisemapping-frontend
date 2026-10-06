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

/**
 * The Markdown the note editor understands, as pure functions on text: the rules applied while
 * typing (a line or a span that has just been completed) and the conversion of pasted Markdown.
 * The produced markup only uses tags and attributes the note sanitizer keeps.
 */

export type BlockRuleType = 'ul' | 'ol' | 'h1' | 'h2' | 'h3';

export type BlockRule = { type: BlockRuleType };

export type InlineRuleType = 'strong' | 'em' | 's' | 'code' | 'a';

export type InlineRule = {
  type: InlineRuleType;
  /** Offset of the opening delimiter in the text the rule was matched against. */
  start: number;
  /** The text between the delimiters, or the link text. */
  content: string;
  /** The link destination, only for links. */
  href?: string;
};

// Browsers type a space at the end of a text as a non-breaking one.
const SPACE = '[ \\u00a0]';

const BLOCK_RULES: { pattern: RegExp; type: BlockRuleType }[] = [
  { pattern: new RegExp(`^[*+-]${SPACE}$`), type: 'ul' },
  { pattern: new RegExp(`^1[.)]${SPACE}$`), type: 'ol' },
  { pattern: new RegExp(`^#${SPACE}$`), type: 'h1' },
  { pattern: new RegExp(`^##${SPACE}$`), type: 'h2' },
  { pattern: new RegExp(`^###${SPACE}$`), type: 'h3' },
];

/**
 * The block a line becomes, given its text up to the caret right after a space was typed:
 * `- `, `* ` or `+ ` start a bulleted list, `1. ` or `1) ` a numbered one and `# ` to `### ` a
 * heading. The marker must be all the line holds before the caret.
 */
export const matchBlockRule = (lineText: string): BlockRule | null => {
  const rule = BLOCK_RULES.find(({ pattern }) => pattern.test(lineText));
  return rule ? { type: rule.type } : null;
};

/**
 * Inline spans, matched at the end of the text: the closing delimiter is the last typed
 * character. The content can not start or end with a space, and an opening `*`, `_` or `~` can
 * not follow a letter or digit, so `snake_case_name` or `2*3*4` stay as they are.
 */
const INLINE_RULES: { pattern: RegExp; type: Exclude<InlineRuleType, 'a'> }[] = [
  { pattern: /(^|[^`])`([^`]+)`$/, type: 'code' },
  { pattern: /(^|[^\w*])\*\*(?![\s*])([^*]*[^\s*])\*\*$/, type: 'strong' },
  { pattern: /(^|[^\w_])__(?![\s_])([^_]*[^\s_])__$/, type: 'strong' },
  { pattern: /(^|[^\w~])~~(?![\s~])([^~]*[^\s~])~~$/, type: 's' },
  { pattern: /(^|[^\w*])\*(?![\s*])([^*]*[^\s*])\*$/, type: 'em' },
  { pattern: /(^|[^\w_])_(?![\s_])([^_]*[^\s_])_$/, type: 'em' },
];

const LINK_RULE = /(^|[^!])\[([^[\]]*\S[^[\]]*)\]\(([^()\s]+)\)$/;

/**
 * The destination of a link written in a note, or null when it must not become a link. Only
 * web and mail addresses are kept: `javascript:`, `data:`, relative paths and anything else are
 * refused. An address starting with `www.` is taken as https.
 */
export const safeLinkUrl = (value: string): string | null => {
  const candidate = value.trim();
  if (!candidate || /[\s<>"']/.test(candidate)) {
    return null;
  }
  const absolute = /^www\./i.test(candidate) ? `https://${candidate}` : candidate;
  let url: URL;
  try {
    url = new URL(absolute);
  } catch {
    return null;
  }
  if (url.protocol === 'mailto:') {
    return /^mailto:[^@\s]+@[^@\s]+$/i.test(absolute) ? absolute : null;
  }
  if ((url.protocol === 'http:' || url.protocol === 'https:') && url.hostname) {
    // The scheme must be the one written: no leading control characters or spaces were dropped.
    return /^https?:\/\//i.test(absolute) ? absolute : null;
  }
  return null;
};

/**
 * The inline span completed by the last character of the text: `**bold**`, `__bold__`,
 * `*italic*`, `_italic_`, `~~strike~~`, `` `code` `` or `[text](url)`. A link with an unsafe
 * destination is not matched, so it stays as text.
 */
export const matchInlineRule = (text: string): InlineRule | null => {
  const link = LINK_RULE.exec(text);
  if (link) {
    const href = safeLinkUrl(link[3]);
    return href ? { type: 'a', start: link.index + link[1].length, content: link[2], href } : null;
  }

  for (const { pattern, type } of INLINE_RULES) {
    const match = pattern.exec(text);
    if (match) {
      return { type, start: match.index + match[1].length, content: match[2] };
    }
  }
  return null;
};

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Spans inside a line of pasted Markdown, the earliest one is converted first.
const INLINE_SPANS: { pattern: RegExp; type: InlineRuleType }[] = [
  { pattern: /`([^`]+)`/, type: 'code' },
  { pattern: /(?<!!)\[([^[\]]*\S[^[\]]*)\]\(([^()\s]+)\)/, type: 'a' },
  { pattern: /(?<![\w*])\*\*(?![\s*])([^*]*[^\s*])\*\*(?!\*)/, type: 'strong' },
  { pattern: /(?<![\w_])__(?![\s_])([^_]*[^\s_])__(?![\w_])/, type: 'strong' },
  { pattern: /(?<![\w~])~~(?![\s~])([^~]*[^\s~])~~(?!~)/, type: 's' },
  { pattern: /(?<![\w*])\*(?![\s*])([^*]*[^\s*])\*(?![\w*])/, type: 'em' },
  { pattern: /(?<![\w_])_(?![\s_])([^_]*[^\s_])_(?![\w_])/, type: 'em' },
];

/** Converts the inline Markdown of one line to escaped markup. */
export const inlineMarkdownToHtml = (text: string): string => {
  let first: { match: RegExpExecArray; type: InlineRuleType } | null = null;
  for (const { pattern, type } of INLINE_SPANS) {
    const match = pattern.exec(text);
    if (match && (!first || match.index < first.match.index)) {
      first = { match, type };
    }
  }
  if (!first) {
    return escapeHtml(text);
  }

  const { match, type } = first;
  const before = escapeHtml(text.slice(0, match.index));
  const after = inlineMarkdownToHtml(text.slice(match.index + match[0].length));
  if (type === 'code') {
    return `${before}<code>${escapeHtml(match[1])}</code>${after}`;
  }
  if (type === 'a') {
    const href = safeLinkUrl(match[2]);
    // An unsafe link stays as the text that was written.
    const span = href
      ? `<a href="${escapeHtml(href)}">${inlineMarkdownToHtml(match[1])}</a>`
      : escapeHtml(match[0]);
    return `${before}${span}${after}`;
  }
  return `${before}<${type}>${inlineMarkdownToHtml(match[1])}</${type}>${after}`;
};

const LIST_ITEM = /^([ \t]*)([*+-]|\d{1,9}[.)])[ \t]+(.*)$/;
const HEADING = /^(#{1,6})[ \t]+(.*?)[ \t#]*$/;
const FENCE = /^[ \t]*```/;

type ListItem = { html: string; children: List[] };
type List = { tag: 'ul' | 'ol'; indent: number; items: ListItem[] };

// Tabs count as four columns, as in Markdown.
const indentWidth = (value: string): number =>
  value.split('').reduce((width, c) => (c === '\t' ? width + 4 - (width % 4) : width + 1), 0);

const listToHtml = (list: List): string =>
  `<${list.tag}>${list.items
    .map((item) => `<li>${item.html || '<br>'}${item.children.map(listToHtml).join('')}</li>`)
    .join('')}</${list.tag}>`;

/** True when pasting the text should convert it: it has Markdown blocks or spans. */
export const looksLikeMarkdown = (text: string): boolean => {
  const lines = text.split(/\r\n?|\n/);
  if (lines.some((line) => LIST_ITEM.test(line) || HEADING.test(line) || FENCE.test(line))) {
    return true;
  }
  return lines.some((line) => inlineMarkdownToHtml(line) !== escapeHtml(line));
};

/**
 * Converts Markdown text to note markup: headings, bulleted and numbered lists nested by
 * indentation, fenced code and the inline spans. Other lines become one block each; blank lines
 * are dropped.
 */
export const markdownToHtml = (text: string): string => {
  const out: string[] = [];
  // The open lists, outermost first.
  let stack: List[] = [];
  const closeLists = () => {
    if (stack.length > 0) {
      out.push(listToHtml(stack[0]));
      stack = [];
    }
  };

  const lines = text.split(/\r\n?|\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (FENCE.test(line)) {
      closeLists();
      const code: string[] = [];
      for (i += 1; i < lines.length && !FENCE.test(lines[i]); i++) {
        code.push(lines[i]);
      }
      out.push(`<pre>${escapeHtml(code.join('\n'))}</pre>`);
      continue;
    }

    const item = LIST_ITEM.exec(line);
    if (item) {
      const indent = indentWidth(item[1]);
      const tag = /^\d/.test(item[2]) ? 'ol' : 'ul';
      const entry: ListItem = { html: inlineMarkdownToHtml(item[3].trim()), children: [] };

      // Close the lists nested deeper than this item.
      while (stack.length > 1 && indent < stack[stack.length - 1].indent) {
        stack.pop();
      }
      const top = stack[stack.length - 1];
      if (!top) {
        stack.push({ tag, indent, items: [entry] });
      } else if (indent > top.indent && top.items.length > 0) {
        // A sub-list of the last item.
        const nested: List = { tag, indent, items: [entry] };
        top.items[top.items.length - 1].children.push(nested);
        stack.push(nested);
      } else if (top.tag === tag) {
        top.items.push(entry);
      } else if (stack.length === 1) {
        // A list of the other kind at the top level starts a new list.
        closeLists();
        stack.push({ tag, indent, items: [entry] });
      } else {
        // A sub-list of the other kind next to the current one.
        stack.pop();
        const parent = stack[stack.length - 1];
        const sibling: List = { tag, indent, items: [entry] };
        parent.items[parent.items.length - 1].children.push(sibling);
        stack.push(sibling);
      }
      continue;
    }

    if (line.trim() === '') {
      continue;
    }

    closeLists();
    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${inlineMarkdownToHtml(heading[2])}</h${level}>`);
    } else {
      out.push(`<div>${inlineMarkdownToHtml(line.trim())}</div>`);
    }
  }
  closeLists();
  return out.join('');
};
