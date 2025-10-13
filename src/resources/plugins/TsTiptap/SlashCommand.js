import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// Slash Menu 扩展
const SlashCommand = Extension.create({
  name: 'slash-command',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .run();
          props.command({ editor, range });
        },
        items: ({ query }) => {
          return [
            { label: 'Heading 1', command: ({ editor }) => editor.commands.setNode('heading', { level: 1 }) },
            { label: 'Bullet List', command: ({ editor }) => editor.commands.toggleBulletList() },
            { label: 'Quote', command: ({ editor }) => editor.commands.setBlockquote() },
            { label: 'Code Block', command: ({ editor }) => editor.commands.setCodeBlock() },
            { label: 'Table', command: ({ editor }) => editor.commands.insertTable({ rows: 3, cols: 3 }) }
          ].filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
        },
        render: () => {
          let popup;
          return {
            onStart: props => {
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                content: renderMenu(props),
                showOnCreate: true,
                interactive: true
              });
            },
            onUpdate: props => {
              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
                content: renderMenu(props)
              });
            },
            onExit: () => {
              popup[0].destroy();
            }
          };
        }
      }
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ];
  }
});
function renderMenu(props) {
  const menu = document.createElement('div');
  menu.className = 'slash-menu';
  props.items.forEach(item => {
    const btn = document.createElement('div');
    btn.className = 'slash-menu-item';
    btn.innerText = item.label;
    btn.onclick = () => props.command(item);
    menu.appendChild(btn);
  });
  return menu;
}

export default SlashCommand;
