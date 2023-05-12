<template>
  <div>
    <TsDialog
      type="slider"
      :isShow="true"
      :ok-text="$t('page.save')"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div>{{ type == 'move' ? $t('term.deploy.movefile') : $t('term.deploy.copyfile') }}</div>
      </template>
      <template v-slot>
        <div class="pl-xs">
          <div>{{ $t('term.deploy.targetpath') }}</div>
          <Tree
            :data="treeData"
            :load-data="getSubTree"
            :multiple="false"
            :check-strictly="true"
            :check-directly="true"
            show-checkbox
            @on-check-change="treeChecked"
          ></Tree>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 版本制品
  components: {},
  props: {
    type: {
      // 操作类型，可选【move/copy】
      type: String,
      default: ''
    },
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      treeData: [],
      newCopyUrl: '' // 复制路径
    };
  },
  beforeCreate() {},
  created() {
    this.getTreeList();
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
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      let deepCopyParams = this.$utils.deepClone(this.params);
      if (deepCopyParams) {
        delete deepCopyParams.pathList;
        delete deepCopyParams.type;
      }
      let params = {
        ...deepCopyParams,
        src: deepCopyParams.src == '/' ? `/${deepCopyParams.name}` : `${deepCopyParams.src}/${deepCopyParams.name}`,
        dest: this.newCopyUrl
      };
      if (params) {
        delete params.name;
      }
      if (this.type == 'move') {
        params.operation = this.type;
        this.$api.deploy.version.moveOrRenameFile(params).then((res) => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.closeDialog(true);
          }
        });
      } else {
        this.$api.deploy.version.copyFile(params).then((res) => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.closeDialog(true);
          }
        });
      }
    },
    closeDialog(needRefersh = false) {
      this.$emit('close', needRefersh);
    },
    treeChecked(nodeList, node) {
      if (node) {
        this.newCopyUrl = node.path;
        // 单选功能处理
        nodeList && nodeList.forEach((item) => {
          item.checked = false;
        });
        node.checked = true;
      }
    },
    getTreeList(path = '/') {
      let params = {
        path: path,
        ...this.params
      };
      this.$api.deploy.version.getDirectoryList(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.treeData = [];
          let treeData = [];
          res.Return && res.Return.forEach(item => {
            treeData.push(item.hasItems ? {
              title: item.name, 
              path: `/${item.name}`,
              disableCheckbox: item.type != 'd',
              loading: false, 
              children: [] 
              
            } : { title: item.name, path: `/${item.name}`, disableCheckbox: item.type != 'd' });
          });
          this.treeData.unshift({
            title: 'HOME',
            expand: true,
            path: '/',
            children: treeData
          });
        }
      });
    },
    getSubTree(node, callback) {
      if (node) {
        let params = {
          ...this.params,
          path: node.path
        };
        this.$api.deploy.version.getDirectoryList(params).then(res => {
          if (res && res.Status == 'OK') {
            let children = [];
            res.Return && res.Return.forEach(item => {
              children.push(item.hasItems 
                ? { title: item.name, 
                  path: `${node.path}/${item.name}`,
                  disableCheckbox: item.type != 'd',
                  loading: false, 
                  children: [] 
                } : {title: item.name, path: `${node.path}/${item.name}`, disableCheckbox: item.type != 'd' });
            });
            callback(children);
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
