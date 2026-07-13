<template>
  <div class="item-sub">
    <div
      v-for="(cd, index) in childrenList"
      :key="cd.uuid"
      :uuid="cd.uuid"
      :parentUuid="cd.parentUuid"
      :index="index"
    >
      <span class="sub-line"></span>
      <div class="ci-list bg-op">
        <div class="ci-item">
          <TsRow :gutter="8">
            <Col span="6">
              <TsFormSelect
                ref="formItem"
                v-model="cd.direction"
                v-bind="directionConfig"
                class="mr-sm"
              ></TsFormSelect>
            </Col>
            <Col span="18">
              <TsFormTree
                ref="formItem"
                v-model="cd.ciName"
                v-bind="treeConfig"
                @on-change="(val, selectItem) => {
                  changeCiName(selectItem, cd);
                }"
              ></TsFormTree>
            </Col>
          </TsRow>
        </div>
        <div class="btn-list">
          <ul class="action-group">
            <li class="action-item tsfont-plus" @click="addItem(cd)">{{ $t('term.cmdb.childlevel') }}</li>
            <li class="action-item tsfont-trash-o" @click="deleteItem(index)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </div>
      <CiTree
        v-if="cd.children"
        ref="formItem"
        :children="cd.children"
        class="item-sub"
      ></CiTree>
      <template v-if="cd.children && cd.children.length > 0"></template>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CiTree',
  components: {
    CiTree: () => import('./ci-tree.vue'),
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    children: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      treeConfig: {
        url: '/api/rest/cmdb/ci/listtree',
        valueName: 'name',
        textName: 'label',
        transfer: true,
        showPath: true,
        validateList: ['required']
      },
      directionConfig: {
        dataList: [
          {
            text: this.$t('term.cmdb.fromci'),
            value: 'from'
          },
          {
            text: this.$t('term.cmdb.toci'),
            value: 'to'
          }
        ],
        validateList: ['required'],
        transfer: true
      },
      childrenList: []
    };
  },
  beforeCreate() {},
  created() {

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
    changeCiName(selectItem, cd) {
      if (selectItem) {
        this.$set(cd, 'ciLabel', selectItem.text);
      } else {
        this.$set(cd, 'ciLabel', '');
      }
    },
    addItem(cd) {
      if (!cd.children) {
        this.$set(cd, 'children', []);
      }
      cd.children.push({
        parentUuid: cd.uuid,
        uuid: this.$utils.setUuid()
      });
    },
    deleteItem(index) {
      this.childrenList.splice(index, 1);
    },
    valid() {
      let isValid = true;
      const list = this.$refs.formItem;
      if (list && list.length > 0) {
        list.forEach(item => {
          if (item.valid && !item.valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {
    children: {
      handler(newVal) {
        this.childrenList = newVal;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.item-sub {
  margin-left: 50px;
  position: relative;
  &::before {
    content: '';
    display: block;
    width: 0;
    position: absolute;
    top: -7px;
    bottom: 0;
    left: -33px;
    margin-bottom: 26px;
    border-left: 1px dotted @default-border;
  }
  .sub-line {
    position: absolute;
    display: inline-block;
    &::before {
      content: '';
      display: block;
      width: 30px;
      height: 0;
      border-top: 1px dotted @default-border;
      position: absolute;
      top: 29px;
      left: -30px;
    }
  }
}
.ci-list {
  display: flex;
  align-items: start;
  justify-content: flex-start;
  padding: 10px 20px;
  margin-bottom: 8px;
  border-radius: 10px;
  .ci-item {
    width: 100%;
    flex: 1;
  }
  .btn-list {
    width: 120px;
    padding-left: 10px;
  }
}
</style>
