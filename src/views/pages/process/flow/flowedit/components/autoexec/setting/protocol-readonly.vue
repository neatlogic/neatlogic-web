<template>
  <div class="protocol">
    <TsFormSelect 
      ref="item" 
      v-bind="protocolConfig"
      :value="value"
      :readonly="true"
      transfer
    ></TsFormSelect>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {
  },
  props: {
    value: [Number, String]
  },
  data() {
    let _this = this;
    return {
      protocolConfig: {
        dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
        multiple: false,
        rootName: 'tbodyList',
        search: true,
        clearable: true,
        transfer: true,
        dealDataByUrl: _this.dealDataByUrlProtocol || null
      },
      currentValue: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    dealDataByUrlProtocol(nodeList) { // 处理默认值的数据结构
      return this.dealDataFilterProtocol(nodeList);
    },
    dealDataFilterProtocol(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];           
      nodeList.forEach(v => {
        let text = '';
        if (v.port) {
          text = v.name + '(' + v.port + ')';
        } else {
          text = v.name;
        }
        columlist.push(
          {text: text, value: v.id}
        );
      });
      return columlist;
    }
  },
  computed: {},
  watch: {}
};
</script>
