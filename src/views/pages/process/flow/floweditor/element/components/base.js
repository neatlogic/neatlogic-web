export default {
  rendered: (node, data) => {
    if (data.customData && data.customData.length > 0) {
      //为了显示顺序一致，倒序遍历
      let index = 0;
      for (let i = data.customData.length - 1; i >= 0; i--) {
        const d = data.customData[i];
        node.addTools([
          {
            name: 'customdata',
            args: {
              markup: [
                {
                  tagName: 'text',
                  textContent: d.label,
                  selector: 'name',
                  attrs: {
                    class: 'text-grey',
                    'font-size': 10,
                    'text-anchor': 'left',
                    'pointer-events': 'none'
                  }
                },
                {
                  tagName: 'text',
                  textContent: d.value,
                  selector: 'text',
                  attrs: {
                    style: 'font-weight:bold;' + (data.bgColor ? 'fill:' + data.bgColor : ''),
                    'font-size': 10,
                    'text-anchor': 'left',
                    'pointer-events': 'none',
                    x: d.label.length * 10 + 2
                  }
                }
              ],
              x: 0,
              y: 0,
              offset: { x: 0, y: -5 - index * 12 }
            }
          }
        ]);
        index++;
      }
    }
  }
};
