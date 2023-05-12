<template>
  <div ref="topo" class="topo-container">{{ $t('message.issthplugin', {target: 'topo'}) }}:</div>
</template>

<script>
import '@/resources/plugins/TsTopoNew';
import data from '@/resources/plugins/TsTopo/data';

var ciOpts = {
  nodeDragable: false,
  nodeRadio: false,
  nodeDeleteable: false,
  linkSelectable: false,
  brushSelect: false,
  brushable: false,
  selectedDragable: false,
  nodeNameAlign: 'left',
  nodeRemarkAlign: 'left',
  nodeFill: '#eaf0ff',
  nodeStroke: '#eaf0ff',
  nodeAnchorable: false,
  selectStrokedasharray: '0 0',
  spaceCancleSelected: [],
  linkCancleSelected: [],
  anchorDisable: function(data) {
    if (data.type === 'attr') return true;
    return false;
  }
};

export default {
  name: 'TsTopo',
  props: {
    sdata: Object,
    opts: Object
  },
  data: function() {
    return {};
  },
  mounted() {
    var topoVm = Topo(this.$refs.topo, this.opts || ciOpts);
    topoVm.fromJson(this.data || data.data2).center(0);
  }
};
</script>
<style scoped>
div.topo-container {
  width: 100%;
  height: 100%;
}
</style>
