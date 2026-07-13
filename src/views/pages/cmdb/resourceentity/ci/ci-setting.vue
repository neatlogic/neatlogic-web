<template>
  <div>
    <div
      v-for="(cd, index) in childrenList"
      :key="cd.uuid"
      :uuid="cd.uuid"
      :parentUuid="cd.parentUuid"
      :index="index"
    >
      <div class="ci-list bg-op">
        <div class="ci-item">
          <TsFormTree
            ref="mainCi"
            v-model="cd.ciName"
            v-bind="treeConfig"
            @on-change="(val, selectItem) => {
              changeCiName(selectItem, cd);
            }"
          ></TsFormTree>
        </div>
        <div class="btn-list">
          <ul class="action-group">
            <li class="action-item tsfont-plus" @click="addItem(cd)">{{ $t('term.cmdb.childlevel') }}</li>
          </ul>
        </div>
      </div>
      <CiTree
        v-if="cd.children"
        ref="subCiTree"
        :children="cd.children"
        class="item-sub"
      ></CiTree>
      <template v-if="cd.children && cd.children.length > 0"></template>
    </div>
  </div>
</template>
<script>
import CiTree from './ci-tree.vue';
export default {
  name: '',
  components: {
    CiTree,
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree')
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
        url: 'api/rest/cmdb/ci/listtree',
        valueName: 'name',
        textName: 'label',
        transfer: true,
        showPath: true,
        validateList: ['required']
      },
      childrenList: this.$utils.deepClone(this.children) || []
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
    addItem(cd) {
      if (!cd.children) {
        this.$set(cd, 'children', []);
      }
      cd.children.push({
        parentUuid: cd.uuid,
        uuid: this.$utils.setUuid()
      });
    },
    changeCiName(selectItem, cd) {
      if (selectItem) {
        this.$set(cd, 'ciLabel', selectItem.text);
      } else {
        this.$set(cd, 'ciLabel', '');
      }
    },
    valid() {
      let isValid = true;
      if (this.$refs.mainCi && !this.$refs.mainCi[0].valid()) {
        isValid = false;
      }
      if (this.$refs.subCiTree && !this.$refs.subCiTree[0].valid()) {
        isValid = false;
      }
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {
    children: {
      handler(newVal) {
        if (!this.$utils.isSame(this.childrenList, newVal)) {
          this.childrenList = this.$utils.deepClone(newVal);
        }
      },
      deep: true
    },
    childrenList: {
      handler(newVal) {
        this.$emit('updateCiList', newVal);
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
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
