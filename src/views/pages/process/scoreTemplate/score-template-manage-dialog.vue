<template>
  <div class="score-template-manage-dialog">
    <!-- 添加/编辑对话框 -->
    <TsDialog
      v-if="operation === 'add' || operation === 'edit'"
      :isShow="visiable"
      :title="operation==='add'? $t('dialog.title.addtarget',{'target':$t('page.template')}) : $t('dialog.title.edittarget',{'target':$t('page.template')})"
      :okText="$t('page.save')"
      className="add-dialog edit-dialog score-template"
      @on-ok="save"
      @on-close="$emit('update:visiable', false)"
    >
      <TsForm ref="saveForm" :itemList="formConfig">
        <template v-slot:dimensionList>
          <ul class="dimension-list">
            <li v-for="(item,index) in scoreTemplate.dimensionList" :key="index" class="dimension-item">
              <TsFormInput
                class="name"
                :placeholder="$t('form.placeholder.required',{target: $t('page.name')})"
                clearable
                :maxlength="50"
                :validateList="['required', 'name-special']"
                :value="item.name"
                @on-change="name => item.name = name"
              />
              <TsFormInput
                class="description"
                :placeholder="$t('form.placeholder.notrequired',{target: $t('page.description')})"
                clearable
                :maxlength="500"
                :value="item.description"
                @on-change="description => item.description = description"
              />
              <div :title="$t('page.dimension', {target: $t('page.add')})" class="add-item text-action" @click="addItem(index)"><i class="tsfont-plus"></i></div>
              <div
                :title="$t('page.dimension', {target: $t('page.delete')})"
                class="remove-item text-action"
                :class="{'not-allowed': scoreTemplate.dimensionList.length === 1}"
                @click="removeItem(index)"
              ><i class="tsfont-minus"></i></div>
            </li>
          </ul>
        </template>
      </TsForm>
    </TsDialog>

    <!-- 关联流程对话框 -->
    <TsDialog
      v-if="operation === 'list'"
      :isShow="visiable"
      :title="name"
      maskClose
      :hasFooter="false"
      className="list-dialog score-template"
      @on-close="$emit('update:visiable', false)"
    >
      <Loading :loadingShow="isLoading" type="fix"></Loading>
      <TsTable
        v-bind="processListConfig"
        @changeCurrent="currentPage => listProcess({currentPage})"
        @changePageSize="pageSize => listProcess({pageSize})"
        @operation="toProcessEditPage"
      />
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: 'ScoreTemplateDialog',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsTable: () => import('components/TsTable/TsTable')
  },
  props: {
    visiable: { type: Boolean, default: false},
    name: {type: String },
    id: {type: Number, default: null},
    operation: {
      type: String,
      required: true,
      validator(value) {
        return ['add', 'edit', 'list'].includes(value);
      }
    }
  },
  data() {
    const vm = this;
    return {
      isLoading: false,
      searchParams: {currentPage: 1, pageSize: 20},
      processListConfig: {},
      scoreTemplate: {
        id: null,
        isActive: 1,
        name: '',
        description: '',
        dimensionList: [
          {name: '', description: '' }
        ]
      },
      formConfig: {
        isActive: {
          name: 'isActive',
          type: 'switch',
          label: this.$t('page.enable'),
          value: 1,
          disabled: false,
          onChange(isActive) {
            vm.scoreTemplate.isActive = isActive;
          }
        },
        name: {
          name: 'name',
          type: 'text',
          label: this.$t('page.name'),
          value: '',
          width: '100%',
          maxlength: 50,
          validateList: ['required', 'name-special', { name: 'searchUrl', url: 'api/rest/score/template/save', params: () => ({id: this.scoreTemplate.id}) }],
          onChange(name) {
            vm.scoreTemplate.name = name;
          }
        },
        dimensionList: {
          name: 'dimensionList',
          type: 'slot',
          label: this.$t('term.process.scoringdimension'),
          validateList: ['required'],
          value: []
        }
      },
      saving: false
    };
  },
  created() {
    if (this.operation === 'edit') {
      this.get();
    }
    if (this.operation === 'list') {
      this.listProcess();
    }
  },
  methods: {
    get() {
      const params = { id: this.id };
      this.$api.process.scoreTemplate
        .get(params)
        .then(res => {
          if (res.Status === 'OK') {
            let {name = '', isActive = 0, processCount = 0} = res.Return || {};
            this.scoreTemplate = res.Return;
            this.formConfig.isActive.value = isActive;
            this.formConfig.isActive.disabled = processCount > 0;
            this.formConfig.name.value = name;
          }
        });
    },
    listProcess(params = {}) {
      this.searchParams = { id: this.id, ...this.searchParams, ...params };
      this.isLoading = true;
      this.$api.process.scoreTemplate
        .listProcess(this.searchParams)
        .then(res => {
          if (res.Status === 'OK') {
            this.isLoading = false;
            const {processList: tbodyList, currentPage, pageSize, pageCount, rowNum} = res.Return;
            const theadList = [{title: this.$t('term.process.relprocess'), key: 'text', type: 'linktext', action: 'view'}];
            this.processListConfig = {theadList, tbodyList, currentPage, pageSize, pageCount, rowNum};
          }
        });
    },
    toProcessEditPage({value, text}) {
      window.open(HOME + '/process.html/#/flow-edit?uuid=' + value + '&name=' + text, '_blank');
    },
    addItem(index) {
      this.scoreTemplate.dimensionList.splice(index + 1, 0, {name: '', description: ''});
    },
    removeItem(index) {
      if (this.scoreTemplate.dimensionList.length === 1) return;
      this.scoreTemplate.dimensionList.splice(index, 1);
    },
    save() {
      if (!this.$refs.saveForm.valid()) {
        return;
      }
      if (!this.saving) {
        this.saving = true;
        const params = {
          id: this.scoreTemplate.id,
          name: this.scoreTemplate.name,
          isActive: this.scoreTemplate.isActive,
          description: this.scoreTemplate.description,
          dimensionArray: this.scoreTemplate.dimensionList
        };
        this.$api.process.scoreTemplate.save(params).then(res => {
          this.saving = false;
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        })
          .finally(setTimeout(() => { //给后台一点点时间保存数据再搜索
            this.$parent.search();
          }, 100))
          .catch(error => {
            this.saving = false;
          });
      }

      this.$emit('update:visiable', false);
    }
  }
};
</script>

<style lang="less">
.add-dialog.edit-dialog.score-template {
	.dimension-item {
    display: flex;
    &:not(:last-child) {
      margin-bottom: 10px;
    }
		& > div {
			&:not(:last-child) {
				margin-right: 5px;
			}
			&.name {
				width: 100px;
			}
			&.description {
				flex: 1;
			}
			&.not-allowed {
				cursor: not-allowed;
			}
		}
	}
}
.list-dialog.score-template {
  .tstable-tr {
    cursor: pointer;
  }
}
</style>
