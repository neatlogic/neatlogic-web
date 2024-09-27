import { ElementFactory } from '@/views/pages/process/flow/floweditor/element/core/ElementFactory.js';
const FlowUtil = {
  //此函数用于只读状态下转换老流程数据，编辑时由于需要更多的数据支持，不使用此函数
  transfer(flowData) {
    const cells = [];
    //旧数据真正的数据在stepList中，因此需要从这里提取，新版本stepList和topo的数据都是一致的。
    const stepList = flowData.process.stepList;
    const nodes = flowData.topo.nodes;
    if (nodes && nodes.length > 0) {
      nodes.forEach(n => {
        const { name, icon, uuid, x, y } = n;
        const config = stepList.find(d => d.uuid === uuid);
        const element = ElementFactory.getElement({ handler: config.handler, type: config.type });
        if (element) {
          //有些节点数据的config并没有uuid，为了一致需要补充上
          if (!config.uuid) {
            config.uuid = uuid;
          }
          cells.push({
            view: 'vue-shape-view',
            id: uuid,
            shape: element.handler || element.type,
            type: config.type,
            handler: config.handler,
            isAllowStart: config.isAllowStart,
            setting: element.setting,
            icon: element.oldSetting ? element.oldSetting.icon : icon,
            position: { x: x, y: y },
            data: config,
            name,
            ports: element.config.ports
          });
        }
      });
    }
    const links = flowData.topo.links;
    //console.log(JSON.stringify(links, null, 2));
    const portMap = { L: 'left', R: 'right', B: 'bottom', T: 'top' };
    if (links && links.length > 0) {
      links.forEach(d => {
        const { uuid, name, type, source, target, sAnchor, tAnchor } = d;
        const dashConfig = {};
        if (type === 'backward') {
          dashConfig.strokeDasharray = 5;
        }
        cells.push({
          id: uuid,
          shape: 'edge',
          type,
          source: { cell: source, port: portMap[sAnchor.dir] },
          target: { cell: target, port: portMap[tAnchor.dir] },
          router: {
            name: 'manhattan'
          },
          labels: [
            {
              attrs: {
                label: {
                  text: name
                }
              }
            }
          ],
          attrs: {
            line: {
              ...dashConfig,
              strokeWidth: 1,
              targetMarker: {
                class: 'marker',
                name: 'classic',
                width: 12,
                height: 8
              },
              class: 'line',
              sourceMarker: {
                class: 'marker',
                name: null,
                width: 12,
                height: 8
              }
            }
          },
          data: { name }
        });
      });
    }
    return cells;
  }
  
};
export default FlowUtil;
