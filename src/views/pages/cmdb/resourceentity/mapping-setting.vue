<template>
  <div>
    <TsRow
      v-for="(item,index) in list"
      :key="index"
      :gutter="10"
      class="pb-sm"
    >
      <Col span="3">
        <div class="name overflow" :title="getMaptext(item.field)">{{ getMaptext(item.field) }}</div>
      </Col>
      <Col span="5">
        <TsFormSelect
          ref="item"
          v-model="item.type"
          :dataList="typeList"
          :placeholder="$t('term.cmdb.inherentfield')+'/'+$t('page.attribute')+'/'+$t('page.relation')"
          :validateList="validateList"
          transfer
          @on-change="changeType(item)"
        ></TsFormSelect>
      </Col>
      <Col span="16">
        <template v-if="handlerType(item.type)">
          <Items
            :is="handlerType(item.type)"
            ref="item"
            :item="item"
            :mainCi="mainCi"
            @change="(val,attr)=>{setConfig(val, attr, item)}"
          ></Items>
        </template>
      </Col>
    </TsRow>
  </div>
</template>
<script>
import Items from './typecomponent/index.js';
export default {
  name: '',
  components: {
    ...Items,
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve)
  },
  props: {
    data: Object,
    mainCi: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      initMainCi: this.$utils.deepClone(this.mainCi),
      list: [],
      typeList: [
        {
          text: this.$t('term.cmdb.inherentfield'),
          value: 'const'
        },
        {
          text: this.$t('page.attribute'),
          value: 'attr'
        },
        {
          text: this.$t('page.relation'),
          value: 'rel'
        }
      ],
      validateList: ['required'],
      fieldList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      this.list = [];
      if (this.data) {
        this.fieldList = this.data.fieldList || [];
        if (this.data.config && !this.$utils.isEmpty(this.data.config.fieldMappingList)) {
          this.fieldList.forEach(item => {
            let findItem = this.data.config.fieldMappingList.find(f => f.field === item.value);
            if (findItem) {
              this.list.push(findItem);
            } else {
              this.list.push({
                field: item.value,
                type: ''
              });
            }
          });
        } else {
          this.updateList();
        }
      }
    },
    changeType(item) {
      Object.keys(item).forEach(key => {
        if (key != 'type' && key != 'field') {
          this.$set(item, key, '');
        }
      });
    },
    setConfig(val, attr, item) {
      this.$set(item, attr, val);
    },
    valid() {
      let isValid = true;
      let itemList = this.$refs.item;
      Array.from(itemList).forEach((item) => {
        if (!item.valid()) {
          isValid = false;
        }
      });
      return isValid;
    },
    getData() {
      return this.list;
    },
    updateList() { //改变主模型时更新list
      this.list = [];
      this.fieldList.forEach(item => {
        this.list.push({
          field: item.value,
          type: ''
        });
      });
    }
  },
  filter: {},
  computed: {
    getMaptext() {
      return (name) => {
        let text = '';
        if (this.fieldList) {
          let findItem = this.data.fieldList.find(item => item.value === name);
          if (findItem) {
            text = findItem.text;
          }
        }
        return text;
      };
    },
    handlerType() {
      return (value) => {
        let type = value + 'Type';
        if (!Items[type]) {
          type = '';
        }
        return type;
      };
    }
  },
  watch: {
    mainCi: {
      handler(val) {
        if (!this.$utils.isSame(val, this.initMainCi)) {
          this.initMainCi = this.$utils.deepClone(val);
          this.updateList();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.name {
  line-height: 32px;
}
</style>
