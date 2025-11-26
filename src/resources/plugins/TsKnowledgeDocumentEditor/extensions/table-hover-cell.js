// tableHoverPlugin.js
import { Plugin } from 'prosemirror-state';

export function tableHoverCell({ onHover, onLeave }) {
  return new Plugin({
    props: {
      handleDOMEvents: {
        mousemove(view, event) {
          const cellDom = event.target.closest('td, th');
          if (!cellDom) {
            onLeave?.();
            return false;
          }
          const rowIndex = cellDom.parentElement.rowIndex;
          const colIndex = cellDom.cellIndex;
          const tableDom = cellDom.closest('table');

          onHover?.({
            cellDom,
            tableDom,
            rowIndex,
            colIndex
          });

          return false;
        },
        mouseleave(view, event) {
          onLeave?.();
          return false;
        }
      }
    }
  });
}
