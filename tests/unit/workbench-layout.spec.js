import { expect } from 'chai';
import {
  createWorkbenchWidget,
  filterValidWorkbenchWidgetList,
  resolveWorkbenchLayout
} from '@/views/components/portal/utils/workbench-layout.js';

describe('workbench layout', () => {
  it('keeps structurally valid unavailable widgets for isolated fallback rendering', () => {
    const validWidget = {
      i: 'one',
      uuid: 'one',
      type: 'missing.widget',
      x: 0,
      y: 0,
      w: 4,
      h: 6
    };
    const invalidWidget = { ...validWidget, i: 'two', x: 10 };

    expect(filterValidWorkbenchWidgetList([validWidget, invalidWidget])).to.deep.equal([validWidget]);
  });

  it('moves colliding widgets below the previous widget', () => {
    const result = resolveWorkbenchLayout([
      { i: 'one', x: 0, y: 0, w: 6, h: 4 },
      { i: 'two', x: 0, y: 0, w: 6, h: 4 }
    ]);

    expect(result[0].y).to.equal(0);
    expect(result[1].y).to.equal(4);
  });

  it('persists the component configuration version when a widget is created', () => {
    const widget = createWorkbenchWidget({
      name: 'demo.widget',
      label: 'Demo',
      version: 3,
      defaultLayout: { w: 4, h: 6 }
    }, { i: 'demo' });

    expect(widget.configVersion).to.equal(3);
  });
});
