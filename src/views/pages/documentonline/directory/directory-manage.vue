<template>
  <div>
    <TsContain :siderWidth="300" enableCollapse>
      <template v-slot:topLeft>
        <div v-if="!isFile">
          <InputSearcher
            v-model="keyword"
            :placeholder="$t('term.documentonline.searchhelp')"
            :style="{width:'300px'}"
            @change="searchDocument(1)"
          ></InputSearcher>
        </div>
        <div v-else-if="filePath" class="action-group text-right">
          <span v-if="moduleGroup !== 'unClassified' && !isRelated(fileConfig)" class="tsfont-bind action-item" @click="addClassification(fileConfig)">{{ $t('term.documentonline.relcurrclass') }}</span>
          <span class="action-item tsfont-plus" @click="openClassifyDialog(fileConfig)">{{ $t('page.add') }}</span>
          <span v-if="moduleGroup !== 'unClassified' && isRelated(fileConfig)" class="action-item pl-sm tsfont-unbind" @click="delClassification(fileConfig)">{{ $t('term.process.move') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <DirectoryTree
          ref="directoryTree"
          :isFile="isFile"
          @selectTreeNode="selectTreeNode"
          @getClassifiedList="getClassifiedList"
        ></DirectoryTree>
      </template>
      <template v-slot:content>
        <div class="document-main">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <div v-if="!isFile" class="pr-nm">
            <template v-if="!loadingShow">
              <div v-for="(item,index) in list" :key="index" class="list border-color">
                <div>
                  <span class="tsfont-file-single pr-xs text-primary"></span>
                </div>
                <div class="item border-color">
                  <div class="title overflow pb-xs">
                    <div class="text-action overflow name" @click="openDetail(item)">{{ item.fileName }}</div>
                    <div class="action-group">
                      <span v-if="moduleGroup !== 'unClassified' && !isRelated(item)" class="tsfont-bind action-item" @click="addClassification(item)">{{ $t('term.documentonline.relcurrclass') }}</span>
                      <span class="action-item tsfont-plus" @click="openClassifyDialog(item)">{{ $t('page.add') }}</span>
                      <span v-if="moduleGroup !== 'unClassified' && isRelated(item)" class="action-item pl-sm tsfont-unbind" @click="delClassification(item)">{{ $t('term.process.move') }}</span>
                    </div>
                  </div>
                  <div class="text-tip line-2" v-html="item.content"></div>
                </div>
              </div>
            </template>
            <div v-if="tableData.currentPage< tableData.pageCount" class="text-href pl-nm" @click="changePage()">{{ $t('page.viewmore') }}</div>
            <NoData v-if="!loadingShow && !list.length" />
          </div>
          <div v-else>
            <DocumentonlineContent
              v-if="filePath"
              :filePath="filePath"
            ></DocumentonlineContent>
            <div v-else>
              <NoData></NoData>
            </div>
          </div>
        </div>
      </template>
    </TsContain>
    <FileDetailDialog
      v-if="isShowDialog"
      :isShow="isShowDialog"
      :fileConfig="fileConfig"
      :moduleGroup="moduleGroup"
      :isRelated="isRelated(fileConfig)"
      @close="closeFileDetailDialog"
    ></FileDetailDialog>
    <AddClassificationDialog
      v-if="isAddDialog"
      :isShow="isAddDialog"
      :classifiedList="classifiedList"
      :fileConfig="fileConfig"
      @close="closeClassifyDialog"
    ></AddClassificationDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    DirectoryTree: resolve => require(['./directory-tree.vue'], resolve),
    DocumentonlineContent: resolve => require(['@/views/pages/documentonline/document/documentonline-content.vue'], resolve),
    FileDetailDialog: resolve => require(['./file-detail-dialog.vue'], resolve),
    AddClassificationDialog: resolve => require(['./add-classification-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      keyword: '',    
      tableData: {},
      list: [],
      filePath: '',
      moduleGroup: '',
      menu: '',
      isFile: false,
      isShowDialog: false,
      fileConfig: {},
      classifiedList: [],
      isAddDialog: false
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    this.getDocumentList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getDocumentList(currentPage) {
      let data = {
        currentPage: currentPage || 1
      };
      this.loadingShow = true;
      if (data.currentPage === 1) {
        this.list = [];
      }
      this.$api.documentonline.getDocumentList(data).then(res => {
        if (res.Status === 'OK') {
          this.tableData = res.Return || {};
          if (this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
            this.list.push(...this.tableData.tbodyList);
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changePage() {
      let currentPage = this.tableData.currentPage + 1;
      if (this.keyword) {
        this.searchDocument(currentPage);
      } else {
        this.getDocumentList(currentPage);
      }
    },
    searchDocument(currentPage) { //搜索关键字
      if (this.keyword) {
        let data = {
          currentPage: currentPage || 1,
          keyword: this.keyword
        };
        this.loadingShow = true;
        this.list = [];
        this.$api.documentonline.searchDocument(data).then(res => {
          if (res.Status === 'OK') {
            this.tableData = res.Return || {};
            if (this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
              this.list.push(...this.tableData.tbodyList);
            }
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      } else {
        this.getDocumentList(1);
      }
    },
    getClassifiedList(list) { //分类列表
      this.classifiedList = list;
    },
    openDetail(item) {
      this.fileConfig = item;
      this.filePath = item.filePath;
      this.isShowDialog = true;
    },
    selectTreeNode(node) {
      this.filePath = '';
      this.isFile = false;
      this.moduleGroup = '';
      this.menu = '';
      this.fileConfig = {};
      if (node) {
        this.moduleGroup = node.moduleGroup;
        this.menu = node.menu || '';
        this.isFile = !!node.isFile;
        this.$nextTick(() => {
          if (this.isFile) {
            this.fileConfig = node;
            this.filePath = node.filePath;
          } else {
            this.getDocumentList(1);
          }
        });
      }
    },
    addClassification(item) {
      this.$api.documentonline.addDocumentonlineConfig({
        moduleGroup: this.moduleGroup,
        menu: this.menu,
        filePath: item.filePath
      }).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.updateFileList();
        }
      });
    },
    delClassification(item) {
      this.$createDialog({
        title: '移除文档',
        content: '确认从当前分类下移除文档？',
        btnType: 'error',
        okText: this.$t('term.process.move'),
        'on-ok': vnode => {
          this.$api.documentonline.deleteFileConfig({
            filePath: item.filePath,
            moduleGroup: this.moduleGroup,
            menu: this.menu
          }).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              this.filePath = '';
              this.updateFileList('delete');
              vnode.isShow = false;
            }
          });
        }
      });
    },
    updateFileList(type) {
      let configFathList = [this.moduleGroup];
      if (this.menu) {
        configFathList.push(this.menu);
      }
      if (!this.isFile) {
        if (this.keyword) {
          this.searchDocument(1);
        } else {
          this.getDocumentList(1);
        }
      }
      this.$refs.directoryTree.updateModuleMenuList(configFathList, type);
    },
    closeFileDetailDialog(type) { //关闭文档详情弹框
      if (type === 'add') {
        this.addClassification(this.fileConfig);
        this.isShowDialog = false;
      } else if (type === 'del') {
        this.delClassification(this.fileConfig);
        this.isShowDialog = false;
      } else if (type === 'edit') {
        this.openClassifyDialog(this.fileConfig);
      } else {
        this.isShowDialog = false; 
      }
    },
    openClassifyDialog(item) {
      this.fileConfig = item;
      this.isAddDialog = true;
    },
    closeClassifyDialog() { //关闭编辑分类
      this.isAddDialog = false;
    }
  },
  filter: {},
  computed: {
    isRelated() {
      return (item) => {
        let related = false;
        if (item.configList && item.configList.length > 0) {
          item.configList.forEach(c => {
            if (c.moduleGroup == this.moduleGroup && c.menu == this.menu) {
              related = true;
            }
          });
        }
        return related;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.document-main {
  .list {
    position: relative;
    display: flex;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid;
    .item {
      flex: 1;
      // border-bottom: 1px solid;
      overflow: hidden;
      .title {
        display: flex;
        justify-content: space-between;
        .name {
          flex: 1;
        }
      }
    }
  }
}
</style>
