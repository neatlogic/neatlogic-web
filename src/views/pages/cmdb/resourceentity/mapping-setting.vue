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
            :ciList="ciList"
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
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree')
  },
  props: {
    resourceEntityData: Object,
    mainCi: {
      type: String,
      default: ''
    },
    ciList: {
      type: Array,
      default: () => []
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
        },
        {
          text: this.$t('term.cmdb.globalattr'),
          value: 'globalAttr'
        },
        {
          text: '引用关系',
          value: 'newRel'
        },
        {
          text: this.$t('term.expression.empty'),
          value: 'empty'
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
      if (this.resourceEntityData) {
        this.fieldList = this.resourceEntityData.fieldList || [];
        if (this.resourceEntityData.config && !this.$utils.isEmpty(this.resourceEntityData.config.fieldMappingList)) {
          this.fieldList.forEach(item => {
            let findItem = this.resourceEntityData.config.fieldMappingList.find(f => f.field === item.value);
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
          type: 'empty'
        });
      });
    },
    updatedNewRelItem() { //更新新关系字段时更新list
      if (!this.$utils.isEmpty(this.list)) {
        this.list = this.list.map(item => {
          if (item.type === 'newRel') {
            return {
              field: item.field,
              type: ''
            };
          } else {
            return item;
          }
        });
        this.list.forEach(item => {
          if (item.type === 'newRel') {
            this.$set(item, 'ci', '');
            this.$set(item, 'rel', '');
            this.$set(item, 'attr', '');
          }
        });
      }
    }

  },
  filter: {},
  computed: {
    getMaptext() {
      return (name) => {
        let text = '';
        if (this.fieldList) {
          let findItem = this.resourceEntityData.fieldList.find(item => item.value === name);
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
    },
    ciList: {
      handler(val) {
        if (!this.$utils.isSame(val, this.initCiList)) {
          this.initCiList = this.$utils.deepClone(val);
          this.updatedNewRelItem();
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.name {
  line-height: 32px;
}
</style>
