<template>
  <TsDialog v-bind="setting" :isShow="true" @on-close="close">
    <div>
      <div class="mb-md">
        <RadioGroup v-model="type">
          <Radio
            v-for="t in typeList"
            :key="t.value"
            :label="t.value"
            :disabled="t.disabled"
          >
            <span v-if="t.disabled" :title="titleFn(t)">{{ t.name }}</span>
            <span v-else>{{ t.name }}</span>
          </Radio>
        </RadioGroup>
      </div>
      <div v-if="type == 'add'">
        <div v-if="ciList && ciList.length > 1" class="ciContainer">
          <div
            v-for="ci in ciList"
            :key="ci.id"
            :class="ci.id == currentCiId ? 'bg-selected' : 'bg-block'"
            class="ci-item radius-md"
            @click="changeCiId(ci)"
          >
            <div class="text-primary ci-icon">
              <i :class="ci.icon" class="ci-icon"></i>
            </div>
            <div class="ci-text">
              <div class="overflow" :title="ci.label">{{ ci.label }}</div>
              <div class="fz10 text-grey overflow" :title="ci.name">{{ ci.name }}</div>
            </div>
          </div>
        </div>
        <EditCiEntity
          v-if="currentCiId"
          ref="editContainer"
          :propCiId="currentCiId"
          :propRootCiId="ciId"
          saveMode="emit"
          mode="dialog"
          :isForm="isForm"
          :hideHeader="true"
          @save="saveNewCiEntity"
          @cancel="close"
        ></EditCiEntity>
      </div>
      <div v-if="type == 'import'">
        <CiEntityList
          ref="ciEntityList"
          :idList="importidList"
          :ciId="ciId"
          :rootCiId="ciId"
          :needAction="false"
          :needCheck="true"
          saveMode="emit"
          mode="dialog"
          @getCheckedCiEntity="updateImport"
        ></CiEntityList>
        <div style="text-align:right" class="mt-md">
          <Button class="mr-md" @click="close">{{ $t('page.cancel') }}</Button>
          <Button type="primary" @click="saveSelectedCiEntity">{{ $t('page.confirm') }}</Button>
        </div>
      </div>
    </div>
  </TsDialog>
</template>
<script>
import EditCiEntity from '@/views/pages/cmdb/cientity/cientity-edit.vue';
import CiEntityList from '@/views/pages/cmdb/cientity/cientity-list.vue';
export default {
  name: '',
  components: {
    EditCiEntity,
    CiEntityList
  },
  filters: {},
  props: {
    ciId: {
      type: Number
    },
    dataConfig: {
      type: Array
    },
    actionAdd: {
      type: Boolean
    }, // 是否可编辑
    actionEdit: {
      type: Boolean
    }, // 是否可编辑
    actionDel: {
      type: Boolean
    }, // 是否可编辑
    selectedList: {
      //选中哪些选项,会多一些通过新增的
      type: [Array, Boolean],
      default: false
    }
  },
  data() {
    let _this = this;
    return {
      isForm: true,
      isShow: true,
      currentCiId: null,
      ciList: [], //配置项列表
      setting: {
        title: this.$t('term.cmdb.editci'),
        maskClose: false,
        width: 'large',
        hasFooter: false
      },
      typeList: [
        {
          name: this.$t('page.newtarget', { target: this.$t('term.cmdb.cientity') }),
          value: 'add',
          disabled: false
        },
        {
          name: this.$t('dialog.title.editordeletetarget', { target: this.$t('term.cmdb.cientity') }),
          value: 'import',
          disabled: false
        }
      ],
      importList: [], //如果是从原来的导入的
      canEdit: false,
      importidList: null,
      type: '',
      canSave: true
    };
  },
  beforeCreate() {},
  created() {
    //this.currentCiId = this.ciId;
    this.typeAdd();
    this.getDownwardCiList();
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
    titleFn(row) {
      let title = '';
      if (row.disabled) {
        if (row.value == 'import') {
          title = '此模型不支持编辑/删除操作，如需编辑/删除配置项，请联系管理员修改表单设置';
          return title;
        }

        if (row.value == 'add') {
          title = '此模型不支持新增操作，如需新增配置项，请联系管理员修改表单设置';
          return title;
        }
      }
    },
    typeAdd() {
      if (this.actionAdd) {
        this.type = 'add';
      } else {
        this.typeList[0].disabled = true;
        this.type = 'import';
      }

      if (!this.actionEdit && !this.actionDel) {
        this.typeList[1].disabled = true;
      }
    },
    changeCiId(ciId) {
      this.currentCiId = ciId.id;
      //通过修改isShow强制数据刷新
      this.isShow = false;
      this.$nextTick(() => {
        this.isShow = true;
      });
    },
    close() {
      this.$emit('close');
    },
    saveNewCiEntity(ciEntityList) {
      if (ciEntityList && ciEntityList.length > 0) {
        this.$emit('save', 'add', ciEntityList);
      }
    },
    saveSelectedCiEntity() {
      const list = this.$refs['ciEntityList'].getSelectedCiEntityList();
      // console.log(JSON.stringify(list, null, 2));
      if (list && list.length > 0) {
        this.$emit('save', 'import', list);
      }
    },
    updateImport(list, lists) {
      // console.log(list, lists);
      this.importidList = list;
      this.importList = lists;
    },
    async getDownwardCiList() {
      await this.$api.cmdb.ci.getDownwardCiList(this.ciId).then(res => {
        //抽象模型和虚拟模型不能添加和编辑，所以要跳过
        if (res.Return && res.Return.length > 0) {
          this.ciList = res.Return.filter(ci => ci.isVirtual == 0 && ci.isAbstract == 0);
        }
        if (this.ciList && this.ciList.length > 0) {
          this.currentCiId = this.ciList[0].id;
        }
      });
    }
  },
  computed: {
    label(h) {
      return function(item, importList) {
        return h => {
          return h('div', [
            h('span', item.name),
            h('Badge', {
              props: {
                count: item.value == 'import' ? importList.length : 0
              }
            })
          ]);
        };
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.ciContainer {
  display: grid;
  grid-template-columns: 20% 20% 20% 20% 20%;
  grid-gap: 5px;
}
.ci-item {
  border: 1px solid @default-border;
  padding: 10px 0px;
  margin-right: 8px;
  margin-bottom: 8px;
  padding-right: 16px;
  cursor: pointer;
  position: relative;
  .ci-icon {
    position: absolute;
    left: 5px;
    top: 5px;
    font-size: 25px;
  }
  .ci-text {
    text-align: left;
    margin-left: 40px;
  }
}
</style>
