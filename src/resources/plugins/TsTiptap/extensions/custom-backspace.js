import { Extension } from '@tiptap/core';

export const CustomBackspace = Extension.create({
  name: 'customBackspace',

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;

        const parent = $from.parent;
        // 如果是空的 listItem，不执行默认 lift
        if (parent.type.name === 'listItem' && parent.textContent === '') {
          return true; // 拦截
        }

        return false; // 其他情况使用默认行为
      }
    };
  }
});
