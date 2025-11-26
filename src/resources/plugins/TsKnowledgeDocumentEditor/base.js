import InsertMenuCommands from '@/resources/plugins/TsKnowledgeDocumentEditor/commands/index.js';
export default {
  methods: {
    executeEditorCommand({menuData, currentInstanceThis}) {
      if (!currentInstanceThis.editor) return;
      const insertPos = currentInstanceThis.getInsertPosition();
      const { commandName, value = {} } = menuData;
      console.log('commandName', commandName, value);
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        commandMethod({
          editor: currentInstanceThis.editor,
          pos: insertPos,
          options: value,
          https: currentInstanceThis.$https
        });
      }
    }
    // insertMenuContent(contentData) {
    // // 工具栏菜单是替换所在光标的位置的内容
    //   const { menuName, hrefUrl, hrefName, uploadImageUrl, rows, cols } = menuConfig || {};
    //   switch (menuName) {
    //     case 'heading1':
    //       this.editor.chain().focus().toggleHeading({ level: 1 }).run();
    //       break;
    //     case 'heading2':
    //       this.editor.chain().focus().toggleHeading({ level: 2 }).run();
    //       break;
    //     case 'heading3':
    //       this.editor.chain().focus().toggleHeading({ level: 3 }).run();
    //       break;
    //     case 'heading4':
    //       this.editor.chain().focus().toggleHeading({ level: 4 }).run();
    //       break;
    //     case 'heading5':
    //       this.editor.chain().focus().toggleHeading({ level: 5 }).run();
    //       break;
    //     case 'heading6':
    //       this.editor.chain().focus().toggleHeading({ level: 6 }).run();
    //       break;
    //     case 'bold':
    //       this.editor.chain().focus().toggleBold().run();
    //       break;
    //     case 'italic':
    //       this.editor.chain().focus().toggleItalic().run();
    //       break;
    //     case 'strikethrough':
    //       this.editor.chain().focus().toggleStrike().run();
    //       break;
    //     case 'orderedList':
    //       this.editor.chain().focus().toggleOrderedList().run();
    //       break;
    //     case 'bulletList':
    //       this.editor.chain().focus().toggleBulletList().run();
    //       break;
    //     case 'link':
    //       this.editor.chain().focus().insertContent({
    //       // 需要设置超链接的文本，所以使用insertContent的方式插入
    //         type: 'text',
    //         text: hrefName,
    //         marks: [
    //           {
    //             type: 'link',
    //             attrs: { href: hrefUrl }
    //           }
    //         ]
    //       }).run();
    //       break;
    //     case 'codeBlock':
    //       this.editor.chain().focus().toggleCodeBlock().run();
    //       break;
    //     case 'alignLeft':
    //       this.editor.chain().focus().setTextAlign('left').run();
    //       break;
    //     case 'alignRight':
    //       this.editor.chain().focus().setTextAlign('right').run();
    //       break;
    //     case 'alignCenter':
    //       this.editor.chain().focus().setTextAlign('center').run();
    //       break;
    //     case 'alignJustify':
    //       this.editor.chain().focus().setTextAlign('justify').run();
    //       break;
    //     case 'uploadImage':
    //       if (uploadImageUrl) {
    //         this.editor.chain().focus().setImage({ src: uploadImageUrl }).run();
    //       }
    //       break;
    //     case 'divide':
    //       this.editor.chain().focus().setHorizontalRule().run();
    //       break;
    //     case 'blockQuote':
    //       this.editor.chain().focus().toggleBlockquote().run();
    //       break;
    //     case 'insertTable':
    //       this.editor.chain().focus().insertTable({ rows: rows, cols: cols, withHeaderRow: true }).run();
    //       break;
    //     case 'searchReplace':
    //       this.isShowSearchReplaceDialog = !this.isShowSearchReplaceDialog;
    //       break;
    //   }
    // },
  }
};
