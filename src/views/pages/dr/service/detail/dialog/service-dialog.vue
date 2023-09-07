<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      :title="type==='add'?$t('page.add'):$t('page.edit') +'依赖服务'"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="nameForm"
            v-model="formData"
            :item-list="formConfig"
          >
            <template v-slot:sceneList>
              <div style="width: 90%">
                <div v-for="(item,index) in sceneList" :key="index" class="flex-center list pb-sm">
                  <TsFormSelect
                    v-model="item.targetId"
                    :dataList="[]"
                    :validateList="validateList"
                    transfer
                    style="flex: 1;"
                  ></TsFormSelect>
                  <div class="tsfont-arrow-right pl-sm pr-sm"></div>
                  <TsFormSelect
                    v-model="item.sourceId"
                    :dataList="[]"
                    :validateList="validateList"
                    transfer
                    style="flex: 1;"
                  ></TsFormSelect>
                  <div v-if="index>0" class="tsfont-trash-o text-tip-active del-icon" @click="delitem(index)"></div>
                </div>
                <Button type="primary" ghost @click="add()"><span class="tsfont-plus">依赖</span></Button>
              </div>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  
  },
  props: {
    type: {
      type: String,
      default: 'add'
    }
  },
  data() {
    return {
      formConfig: {
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.scenarioname'),
          validateList: ['required', 'name-special', { name: 'searchUrl', url: '', key: 'name' }],
          width: '90%'
        },
        sceneList: {
          type: 'slot',
          label: this.$t('term.dr.migrationdirection'),
          validateList: ['required'],
          width: '90%'
        }
      },
      validateList: ['required'],
      formData: {},
      sceneList: [
        {
          sourceId: '1',
          targetId: '2'
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
    okDialog() {
      this.closeDialog();
    },
    closeDialog() {
      this.$emit('close');
    },
    add() {
      this.sceneList.push({
        sourceId: null,
        targetId: null
      });
    },
    delitem(index) {
      this.sceneList.splice(index, 1);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
.list {
  position: relative;
  .del-icon {
    position: absolute;
    right: -20px;
  }
}
</style>
