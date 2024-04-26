<template>
  <div class="controller-group">
    <TsFormTree
      ref="fromCi"
      v-model="item.fromCi"
      v-bind="treeConfig"
      :placeholder="$t('term.cmdb.attrci')"
      @on-change="changeFromCi(item)"
    ></TsFormTree>
    <template v-if="item.fromCi">
      <TsFormSelect
        ref="fromAttr"
        v-model="item.fromAttr"
        v-bind="attrConfig"
        :placeholder="$t('page.attribute')"
        :params="getParams(item.fromCi)"
        @on-change="(val, config, selectItem)=>{changeFromAttr(selectItem, item)}"
      ></TsFormSelect>
      <TsFormSelect
        v-if="item.toCi"
        ref="toAttr"
        v-model="item.toAttr"
        v-bind="attrConfig"
        :placeholder="$t('term.cmdb.toattr')"
        :params="getParams(item.toCi)"
        :dealDataByUrl="dealDataByUrl"
        transfer
      ></TsFormSelect>
    </template>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve)
  },
  props: {
    item: Object,
    mainCi: String
  },
  data() {
    return {
      treeConfig: {
        url: 'api/rest/cmdb/ci/listtree',
        valueName: 'name',
        textName: 'label',
        transfer: true,
        showPath: true,
        // params: {
        //   rootCiName: this.mainCi
        // },
        validateList: ['required']
      },
      attrConfig: {
        url: '/api/rest/cmdb/ci/listattr/forview',
        validateList: ['required'],
        valueName: 'name',
        textName: 'label',
        isSquare: false,
        transfer: true
      },
      dataList: [
        {
          name: '_id',
          label: 'ID'
        },
        {
          name: '_uuid',
          label: 'UUID'
        },
        {
          name: '_name',
          label: this.$t('page.name')
        },
        {
          name: '_fcu',
          label: this.$t('page.creator')
        },
        {
          name: '_fcd',
          label: this.$t('page.createdate')
        },
        {
          name: '_lcu',
          label: this.$t('page.fcu')
        },
        {
          name: '_lcd',
          label: this.$t('page.lcu')
        },
        {
          name: '_typeId',
          label: this.$t('page.type') + 'ID'
        }
      ],
      validateList: ['required']
    };
  },
  beforeCreate() {},
  created() {
    if (!this.item.fromCi) {
      this.item.fromCi = this.mainCi;
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeFromCi(item) {
      this.$set(item, 'fromAttr', '');
      this.$set(item, 'toCi', '');
    },
    changeFromAttr(config, item) {
      this.$set(item, 'toAttr', '');
      if (config && config.targetCiName) {
        this.$set(item, 'toCi', config.targetCiName);
      } else {
        this.$set(item, 'toCi', '');
      }
    },
    setConfig(val, attr) {
      this.$emit('change', val, attr);
    },
    valid() {
      let isValid = true;
      let list = this.$refs;
      Object.keys(list).forEach(key => {
        if (this.$refs[key] && !this.$refs[key].valid()) {
          isValid = false;
        }
      });
      return isValid;
    },
    dealDataByUrl(nodeList) {
      let columlist = this.$utils.deepClone(this.dataList); //映射属性需要补上一些固有属性选项
      if (nodeList && nodeList.length > 0) {
        nodeList.forEach(item => {
          if (item.type != 'select') {
            columlist.push(item);
          }
        });
      }
      return columlist;
    }
  },
  filter: {},
  computed: {
    getParams() {
      return (val) => {
        return {
          ciName: val
        };
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
