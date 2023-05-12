<template>
  <TsContain border="border">
    <template v-slot:navigation>
      <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
    </template>
    <template v-slot:topLeft>
      <TsFormInput v-model="solutionConfig.name" maxlength="50" :validateList="nameValidateList"></TsFormInput>
    </template>
    <template v-slot:topRight>
      <div class="action-group">
        <div class="action-item">
          <TsFormSwitch
            v-model="solutionConfig.isActive"
            :showStatus="true"
          ></TsFormSwitch>
        </div>
        <div class="action-item"><Button type="primary" :disabled="saving" @click="saveSolution">{{ $t('page.save') }}</Button></div>
      </div>
    </template>
    <template v-slot:content>
      <div class="content-container">
        <div class="editor-container">
          <TsForm :itemList="formItemList">
            <template v-slot:type>
              <div class="action-group">
                <span class="action-item tsfont-edit" @click="toEventTypeManage">{{ $t('page.classifytarget', {target:$t('page.edit')}) }}</span>
                <span class="action-item" @click="refreshTree"><i :class="{ loading: isLoadingTree }" class="tsfont-rotate-right"></i>{{ $t('page.classifytarget', {target:$t('page.refresh')}) }}</span>
              </div>
              <div class="tree-container">
                <Tree
                  multiple
                  :data="treeList"
                  class="customize-tree"
                  :load-data="getSubTree"
                  @on-select-change="changeEventTypeList"
                ></Tree>
              </div>
            </template>
          </TsForm>
        </div>
      </div>
    </template>
  </TsContain>
</template>

<script>
export default {
  name: 'EventSolutionEdit',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  data() {
    const vm = this;
    return {
      solutionConfig: {
        id: null,
        name: '',
        isActive: 1,
        content: '',
        eventTypeList: []
      },
      nameValidateList: [
        'required',
        'name-special',
        {
          name: 'searchUrl',
          url: 'api/rest/event/solution/save',
          key: 'name',
          params: () => ({ id: this.solutionConfig.id })
        }
      ],
      initialSolution: '',
      isLoadingTree: false,
      operation: this.$route.query.operation,
      treeList: [],
      formItemList: {
        type: {
          label: this.$t('term.process.relclassify'),
          type: 'slot',
          desc: this.$t('term.process.relclassifydes')
        },
        content: {
          type: 'ckeditor',
          label: this.$t('page.content'),
          validateList: ['required'],
          onChange(value) {
            vm.solutionConfig.content = value;
          }
        }
      },
      saving: false
    };
  },
  async created() {
    await this.initSolution();
    this.initialSolution = JSON.stringify(this.solutionConfig);
    this.$addWatchData(this.solutionConfig);
    this.getTree();
  },
  /*beforeRouteLeave(to, from, next, url) {
    let isSame = this.$utils.isSame(JSON.parse(this.initialSolution), this.solutionConfig);
    if (isSame) {
      url ? this.$utils.gotoHref(url) : next();
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(
        this,
        {
          save: {
            //保存数据
            fn: async vnode => {
              return await _this.saveSolution();
            }
          }
        },
        to,
        from,
        next,
        url
      );
    }
  },*/
  methods: {
    async beforeLeave() {
      return await this.saveSolution();
    },
    initSolution() {
      if (this.operation === 'add') {
        document.title = this.$t('dialog.title.addtarget', {target: this.$t('term.process.solution')});
        this.solutionConfig.name = this.$route.query.name;
        return Promise.resolve();
      }
      const params = { id: this.$route.query.id };
      return this.$api.process.eventSolution.get(params).then(res => {
        if (res.Status === 'OK') {
          let { id, name, isActive, content, eventTypeList } = res.Return.solution;
          eventTypeList = eventTypeList.map(item => item.id);
          if (this.operation === 'edit') {
            document.title = this.$t('dialog.title.edittarget', {target: this.$t('term.process.solution')});
            this.solutionConfig = { id, name, isActive, content, eventTypeList };
            this.formItemList.content.value = content;
          } else if (this.operation === 'copy') {
            document.title = this.$t('dialog.title.copytarget', {target: this.$t('term.process.solution')});
            this.formItemList.content.value = content;
            this.solutionConfig = { name: name + '_copy', isActive, content, eventTypeList };
          }
        }
      });
    },
    getTree() {
      const params = { id: this.$route.query.id };
      return this.$api.process.eventSolution.getTree(params).then(res => {
        if (res.Status === 'OK') {
          this.treeList = this.formatTree(res.Return.eventTypeTree);
        }
      });
    },
    refreshTree() {
      this.isLoadingTree = true;
      this.getTree().then(() => {
        setTimeout(() => {
          this.isLoadingTree = false;
          this.$Message.success(this.$t('message.executesuccess'));
        }, 1000);
      });
    },
    getSubTree(parent, callback) {
      const params = {
        parentId: parent.id
      };
      this.$api.process.eventType.getTree(params).then(res => {
        if (res.Status === 'OK') {
          const subTreeList = this.formatTree(res.Return.tbodyList);
          callback(subTreeList);
        }
      });
    },
    formatTree(treeList) {
      return treeList.map(item => {
        let node = this.formatTreeNode(item);
        if (node.children.length > 0) {
          node.expand = true;
          node.children = this.formatTree(node.children);
        }
        return node;
      });
    },
    formatTreeNode(item) {
      const node = {
        ...item,
        title: item.name,
        expand: false
      };
      if (node.childCount !== node.children.length) {
        node.loading = false;
      }
      if (this.solutionConfig.eventTypeList.includes(item.id)) {
        node.checked = true;
        node.selected = true;
      }
      return node;
    },
    changeEventTypeList(selectedList) {
      this.solutionConfig.eventTypeList = selectedList.map(item => item.id);
    },
    async saveSolution() {
      let isSuccess = true;
      if (this.solutionConfig.content === '') {
        this.$Notice.error({ title: this.$t('page.error'), desc: this.$t('form.validate.required', {target: this.$t('term.process.solutioncontent')})});
        return false;
      }
      if (!this.saving) {
        this.saving = true;
        const params = this.solutionConfig;
        
        await this.$api.process.eventSolution
          .save(params)
          .then(res => {
            this.saving = false;
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              this.initialSolution = JSON.stringify(this.solutionConfig);
              this.$addWatchData(this.solutionConfig);
            }
          })
          .catch(error => {
            this.saving = false;
            isSuccess = false;
          });
      }
      return isSuccess;
    },
    toEventTypeManage() {
      this.$router.push({path: '/event-type-manage'});
      //window.open(HOME + '/process.html#/event-type-manage', '_blank');
    }
  }
};
</script>

<style lang="less" scoped>
</style>

<style lang="less">
@import './tree.less';
</style>
