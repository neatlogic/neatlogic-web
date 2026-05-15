import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const SearchHighlightKey = new PluginKey('search-highlight');

export const SearchHighlight = Extension.create({
  name: 'searchHighlight',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: SearchHighlightKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, old) {
            const meta = tr.getMeta(SearchHighlightKey);
            if (meta && meta.results) {
              return DecorationSet.create(tr.doc, meta.results.map((m, i) =>
                Decoration.inline(m.from, m.to, {
                  class: meta.activeIndex === i ? 'tiptap-search-active' : 'tiptap-search-highlight'
                })
              ));
            }
            return old;
          }
        },
    
        props: {
          decorations(state) {
            return this.getState(state);
          }
        }
      })
    ];
  }
});

