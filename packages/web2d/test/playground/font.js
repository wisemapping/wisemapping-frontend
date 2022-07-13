import $ from 'jquery';
import { Workspace, Text } from '../../src';

global.$ = $;

function multiline(text, fontName, elemId) {
  const workspace = new Workspace();
  workspace.setSize('200px', '240px');
  workspace.setCoordSize('200', '240');
  workspace.setCoordOrigin(0, 0);

  [6, 8, 10, 15].forEach((size, i) => {
    const wText = new Text();
    workspace.append(wText);

    wText.setText(text);
    wText.setFont(fontName, size, 'bold');
    wText.setPosition(30, 50 * i);
    wText.setColor('blue');
  });

  workspace.addItAsChildTo($(`#${elemId}`));
}

function alignments(text, family, elemId) {
  const workspace = new Workspace();
  workspace.setSize('260px', '240px');
  workspace.setCoordSize('260', '240');
  workspace.setCoordOrigin(0, 0);

  ['center', 'left', 'right'].forEach((align, i) => {
    const wText = new Text();
    workspace.append(wText);

    wText.setText(text);
    wText.setFont(family, 8, 'bold');
    wText.setPosition(30, 80 * i);
    wText.setColor('green');
    wText.setTextAlignment(align);
  });

  workspace.addItAsChildTo($(`#${elemId}`));
}

// Multine tests ...
['Arial', 'Tahoma', 'Verdana', 'Times', 'Brush Script MT'].forEach((fontName, i) => {
  multiline('This multine text.\nLine 1 :)\nLine2', fontName, `multi${i}`);
});

// Multine tests and alingments .. ...
['Arial', 'Tahoma', 'Verdana', 'Times', 'Brush Script MT'].forEach((fontName, i) => {
  alignments(
    'This multine text.\nThis is the long line just because :)\nShort line',
    fontName,
    `amulti${i}`,
  );
});
