import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const hoverHighlightKey = new PluginKey('hoverHighlight');

export function HoverHighlightPlugin() {
  return new Plugin({
    key: hoverHighlightKey,

    state: {
      init() {
        return DecorationSet.empty;
      },

      apply(tr, old) {
        const meta = tr.getMeta(hoverHighlightKey);

        if (!meta) return old.map(tr.mapping, tr.doc);

        if (meta.clear) {
          return DecorationSet.empty;
        }

        if (meta.add) {
          const { from, to } = meta.add;

          const decoration = Decoration.node(from, to, {
            class: 'block-hover-highlight'
          });

          return DecorationSet.create(tr.doc, [decoration]);
        }

        return old;
      }
    },

    props: {
      decorations(state) {
        return this.getState(state);
      }
    }
  });
}
