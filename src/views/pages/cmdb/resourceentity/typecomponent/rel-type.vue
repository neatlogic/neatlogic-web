<template>
  <div class="controller-group">
    <TsFormTree
      ref="fromCi"
      v-model="item.fromCi"
      v-bind="treeConfig"
      :placeholder="$t('term.cmdb.fromci')"
      @on-change="changeCi(item)"
    ></TsFormTree>
    <TsFormTree
      ref="toCi"
      v-model="item.toCi"
      v-bind="treeConfig"
      :placeholder="$t('term.cmdb.toci')"
      @on-change="changeCi(item)"
    ></TsFormTree>
    <TsFormSelect
      v-if="item.fromCi && item.toCi"
      ref="direction"
      v-model="item.direction"
      :dataList="directionList"
      :validateList="validateList"
      :placeholder="$t('term.cmdb.attrci')"
      transfer
      @on-change="()=>{
        $set(item,'fromAttr','');
        $set(item,'toAttr','');
      }"
    ></TsFormSelect>
    <template v-if="item.direction">
      <TsFormSelect
        v-if="item.direction === 'to'"
        ref="toAttr"
        v-model="item.toAttr"
        v-bind="attrConfig"
        :params="getParams(item.toCi)"
        :dealDataByUrl="dealDataByUrl"
      ></TsFormSelect>
      <TsFormSelect
        v-else
        ref="fromAttr"
        v-model="item.fromAttr"
        v-bind="attrConfig"
        :params="getParams(item.fromCi)"
        :dealDataByUrl="dealDataByUrl"
      ></TsFormSelect>
    </template>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree')
  },
  props: {
    item: Object
  },
  data() {
    return {
      treeConfig: {
        url: 'api/rest/cmdb/ci/listtree',
        valueName: 'name',
        textName: 'label',
        transfer: true,
        showPath: true,
        validateList: ['required']
      },
      validateList: ['required'],
      directionList: [
        {
          text: this.$t('term.cmdb.fromci'),
          value: 'from'
        },
        {
          text: this.$t('term.cmdb.toci'),
          value: 'to'
        }
      ],
      attrConfig: {
        url: '/api/rest/cmdb/ci/listattr/forview',
        validateList: ['required'],
        valueName: 'name',
        textName: 'label',
        placeholder: this.$t('page.attribute'),
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
      ]
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
    changeCi(item) {
      this.$set(item, 'direction', '');
      this.$set(item, 'fromAttr', '');
      this.$set(item, 'toAttr', '');
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
      let columlist = this.$utils.deepClone(this.dataList); //需要补上一些固有属性选项
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
