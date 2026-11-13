// Web stand-in for react-native-enriched-markdown.
//
// The real package is a Fabric host: on web codegenNativeComponent yields a
// component that renders nothing, so both the composer field and every
// assistant message were invisible. This shim keeps the same exports and the
// imperative handle the composer calls, backed by a textarea and plain Text.
'use strict';

const React = require('react');
const ReactNativeWeb = require('react-native-web');

const { StyleSheet, Text } = ReactNativeWeb;

function flatten(style) {
  return StyleSheet.flatten(style) || {};
}

function EnrichedMarkdownText(props) {
  const { markdown, style, numberOfLines } = props;
  return React.createElement(
    Text,
    { style: style, numberOfLines: numberOfLines },
    String(markdown == null ? '' : markdown),
  );
}

const EnrichedMarkdownTextInput = React.forwardRef(function EnrichedMarkdownTextInput(props, ref) {
  const elementRef = React.useRef(null);
  const {
    autoFocus,
    defaultValue,
    editable = true,
    multiline = true,
    onChangeMarkdown,
    onChangeText,
    onKeyPress,
    onSubmit,
    placeholder,
    style,
    submitOnReturn,
    testID,
  } = props;

  const emit = React.useCallback(
    (value) => {
      if (onChangeText) onChangeText(value);
      if (onChangeMarkdown) onChangeMarkdown(value);
    },
    [onChangeMarkdown, onChangeText],
  );

  React.useImperativeHandle(ref, () => ({
    focus: () => elementRef.current && elementRef.current.focus(),
    blur: () => elementRef.current && elementRef.current.blur(),
    measure: (callback) => callback && callback(0, 0, 0, 0, 0, 0),
    measureInWindow: (callback) => callback && callback(0, 0, 0, 0),
    measureLayout: (_relative, onSuccess) => onSuccess && onSuccess(0, 0, 0, 0),
    setValue: (markdown) => {
      if (!elementRef.current) return;
      elementRef.current.value = markdown;
      emit(markdown);
    },
    setSelection: (start, end) => {
      if (!elementRef.current) return;
      elementRef.current.setSelectionRange(start, end);
    },
    insertText: (text) => {
      const node = elementRef.current;
      if (!node) return;
      const start = node.selectionStart == null ? node.value.length : node.selectionStart;
      const end = node.selectionEnd == null ? start : node.selectionEnd;
      node.value = node.value.slice(0, start) + text + node.value.slice(end);
      node.selectionStart = node.selectionEnd = start + text.length;
      emit(node.value);
    },
    getMarkdown: () => Promise.resolve(elementRef.current ? elementRef.current.value : ''),
    getCaretRect: () => Promise.resolve({ x: 0, y: 0, width: 0, height: 0 }),
    toggleBold: () => {},
    toggleItalic: () => {},
    toggleUnderline: () => {},
    toggleStrikethrough: () => {},
    toggleSpoiler: () => {},
    toggleHeading: () => {},
    toggleUnorderedList: () => {},
    toggleOrderedList: () => {},
    indentList: () => {},
    outdentList: () => {},
    setLink: () => {},
    insertLink: (_text) => {},
    insertMention: (displayText) => {
      const node = elementRef.current;
      if (!node) return;
      node.value += displayText;
      emit(node.value);
    },
    startMention: () => {},
    removeLink: () => {},
    copyToClipboard: () => {
      if (elementRef.current && navigator.clipboard) navigator.clipboard.writeText(elementRef.current.value);
    },
  }));

  const boxStyle = flatten(style);
  const textareaStyle = {
    ...boxStyle,
    width: '100%',
    height: '100%',
    minHeight: 40,
    border: 'none',
    outline: 'none',
    resize: 'none',
    background: 'transparent',
    color: boxStyle.color || '#171717',
    fontFamily: boxStyle.fontFamily || 'inherit',
    fontSize: boxStyle.fontSize || 16,
    lineHeight: boxStyle.lineHeight ? `${boxStyle.lineHeight}px` : '24px',
    boxSizing: 'border-box',
  };

  return React.createElement('textarea', {
    ref: elementRef,
    autoFocus: Boolean(autoFocus),
    defaultValue: defaultValue || '',
    disabled: editable === false,
    placeholder: placeholder,
    'data-testid': testID,
    onChange: (event) => emit(event.target.value),
    onKeyDown: (event) => {
      if (onKeyPress) onKeyPress({ nativeEvent: { key: event.key } });
      if (event.key === 'Enter' && !event.shiftKey && submitOnReturn && onSubmit) {
        event.preventDefault();
        onSubmit(elementRef.current ? elementRef.current.value : '');
      }
    },
    style: textareaStyle,
    wrap: 'soft',
    multiline: multiline ? 'true' : undefined,
  });
});

module.exports = { EnrichedMarkdownText, EnrichedMarkdownTextInput };
module.exports.default = module.exports;
