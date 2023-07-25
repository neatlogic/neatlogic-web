<template>
  <div>
    <!-- start_必填 -->
    <!-- {{ setting }} -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <!-- end_必填 -->

    <a
      href="javascript:void(0)"
      class="isChoice"      
      @click="isOpen"
    ><i class="tsfont-check"></i>请选择:</a>

    <div class="tagMaxheight">
      <Tag
        v-for="(item, i) in selectedCiEntityList"
        :key="i"
        type="dot"
        size="large"
        :closable="true"
        @on-close="delRelEntity(item,i )"
      >
        <span :title="item.title" class="overflow" :class="{inlines:item.title.length > 20}">{{ item.title }}</span>
      </Tag>
    </div>

    <TsDialog
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot:header>
        <div>选择配置项</div>
      </template>
      <template v-slot>
        <Row>
          <Col span="12">
            <div class="ci-left">
              <Input v-model="searchWord" placeholder="请输入关键词搜索" @on-enter="searchTree(searchWord,treeData)" />
              <Tree
                :data="treeData"
                expand-node
                show-checkbox
                class="cmdb-tree"
                @on-check-change="selectTreeNode"
              ></Tree>
            </div>
          </Col>
          <Col span="12">
          </Col>
        </Row>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="ok()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>

    <div class="formsetting-block">
      <label class="formsetting-label text-grey">{{ $t('page.inputtip') }}</label>
      <div class="formsetting-text bg-block">
        <div class="formsetting-block">
          <label class="formsetting-label text-grey inner-label">{{ $t('page.inputtip') }}</label>
          <div class="formsetting-text">
            <TsFormInput v-model="setting.placeholder"></TsFormInput>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: 'FormtreeSelect',
  components: { TsFormInput },
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },
  data() {
    return {
      selectedCiEntityList: [],
      treeData: [],
      temData: [],
      searchWord: '',
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: false,
        width: 'mini'
      }
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
    async init() {
      await this.searchCiTypeCi();
    },
    async searchTree(value, arr) { 
      if (!value) { //内容为空时，查询所有
        this.treeData = [];
        this.treeData = this.$utils.deepClone(this.temData);
        this.isOpen();        
        // console.log(this.treeData);
      } else {
        const newTreeData = this.$utils.deepClone(this.temData);
        const rebuildData = (value, treeData) => {
          let newarr = [];
          treeData.forEach(element => {
            if (element.children && element.children.length) {
              if (element.name.indexOf(value) > -1) {
                element.expand = true;
                newarr.push(element);
              }
              const ab = rebuildData(value, element.children);
              const obj = {
                ...element,
                expand: true,
                children: ab
              };
              if (ab && ab.length) {
                newarr.push(obj);
              }
            } else {
              if (element.name.indexOf(value) > -1) {
                newarr.push(element);
              }
            }
          });
          return newarr;
        };
        this.treeData = [];
        this.treeData = rebuildData(value, newTreeData);
      }
      // console.log(this.temData, '---');
    },
    async searchCiTypeCi() {
      await this.$https.post('/api/rest/cmdb/ci/citype/search', {}).then(res => {
        let resdata = res.Return || [];
        let arrObj = [];
        if (resdata.length > 0) {
          let dataSet = this.setting.selectedCiEntityList;
          this.selectedCiEntityList = this.setting.selectedCiEntityList;
          resdata.forEach(v => {
            if (v.ciList.length > 0) {
              v.title = v.name;          
              v.children = [];
              v.ciList.forEach(j => {
                v.children.push(
                  Object.assign(j, {title: j.label})
                );
              });
              arrObj.push(v);
            }
          });
          this.treeData = JSON.parse(JSON.stringify(arrObj));   
          this.temData = JSON.parse(JSON.stringify(arrObj)); // 为了搜索的时候取这个变量的数据
        }
      });
    },
    async isOpen() {
      // console.log(this.selectedCiEntityList, '===');
      if (this.selectedCiEntityList && this.selectedCiEntityList.length > 0) {
        this.selectedCiEntityList.forEach(v => {
          this.treeData.forEach(j => {
            if (j.children) {
              j.children.forEach(n => {
                if (v.id == n.id) {
                  // n.checked = true;
                  this.$set(n, 'checked', true);
                }
              });
            }
          });
        });
      }
      this.dialogConfig.isShow = true;
    },
    delRelEntity(item, i) {
      this.selectedCiEntityList.splice(i, 1);
    },
    close() {
      this.treeData.forEach(j => {
        j.checked = false;
        if (j.children) {
          j.children.forEach(n => {
            n.checked = false;
          });
        }
      });
      this.dialogConfig.isShow = false;
    },
    selectTreeNode(nodeList, node) {
      //选中类型
      this.$set(node, 'checked', node.checked);
      // console.log('node', node, nodeList);
      this.temData.forEach(v => { //为了和treedata数据保持同步
        if (v.id == node.id) {
          this.$set(node, 'checked', node.checked);
          if (v.children) {
            v.children.forEach(j => {
              j.checked = true;
            });
          }
        } else {
          v.children.forEach(j => {
            if (node.id == j.id) {
              j.checked = true;
            }    
          });
        }
      });
    },
    renderContent(h, { root, node, data }) {
      //渲染树的lable名称
      return h('span', {
        staticClass: '',
        ciList: {
          innerHTML: data.name
        }
      });
    },
    ok() {
      this.selectedCiEntityList = []; // 点击确定之后的数据，只能选择一类数据
      this.treeData.forEach(v => {
        if (v.children) {
          v.children.forEach(j => {
            if (j.checked) {
              this.selectedCiEntityList.push(j);
            }
          });
        }
      });
      // console.log(this.setting, 'ooo', this.selectedCiEntityList);
      this.setting.selectedCiEntityList = [];
      this.setting.selectedCiEntityList = this.selectedCiEntityList;
      this.dialogConfig.isShow = false;
    },
    getLevelDataList(level) {
      let _this = this;
      if (!_this.setting.matrixUuid) {
        return;
      }
    },
    validComponent() {
      let validList = [];
      if (this.$refs.dataSource && this.$refs.dataSource.validComponent) {
        validList = this.$refs.dataSource.validComponent();
      }
      return validList;
    }
  },
  filter: {},
  computed: {
  },
  watch: {
  }
};
</script>

<style lang="less" scoped>
  .inner-label{
    opacity: 0.6;
  }
  .tagMaxheight{
    max-height: 450px;
    overflow: auto;
  }
  .inlines{
  width: 85%;
  display: inline-block;
}
</style>
