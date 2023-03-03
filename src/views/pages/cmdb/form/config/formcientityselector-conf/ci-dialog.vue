<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
  >
    <template v-slot:header>
      <div>选择配置项</div>
    </template>
    <template v-slot>
      <div>
        <InputSearcher
          v-model="searchParam.keyword"
          @change="searchCiType()"
        ></InputSearcher>
        <Tree
          :data="ciTypeList"
          expand-node
          show-checkbox
          @on-check-change="selectCi"
        ></Tree>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">取消</Button>
      <Button type="primary" @click="save()">确定</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: {
    ciList: {type: Array}
  },
  data() {
    return {
      searchParam: {keyword: ''},
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'mini'
      },
      keyword: '',
      ciTypeList: [],
      selectedList: []
    };
  },
  beforeCreate() {},
  created() {
    this.init();
    this.searchCiType();
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
    init() {
      this.selectedList = this.ciList;
    },
    selectCi(item) {
      this.selectedList = [];
      if (item) {
        item.forEach(element => {
          if (element.type === 'ci') {
            this.selectedList.push(element);
          }
        });
      }
    },
    searchCiType() {
      this.ciTypeList = [];
      this.$api.cmdb.ci.searchCiTypeCi(this.searchParam).then(res => {
        const ciTypeList = res.Return;
        if (ciTypeList.length > 0) {
          ciTypeList.forEach(citype => {
            const ciTypeObj = {id: citype.id, title: citype.name, children: [], type: 'citype'};
            citype.ciList.forEach(ci => {
              const ciObj = {id: ci.id, title: ci.label, type: 'ci'};
              if (this.selectedList && this.selectedList.find(d => d.id === ci.id)) {
                ciObj['checked'] = true;
                ciTypeObj['expand'] = true;
              }
              ciTypeObj.children.push(ciObj);
            });
            this.ciTypeList.push(ciTypeObj);
          });
        }
      });
    },
    close() {
      this.$emit('close');
    },
    save() {
      this.$emit('close', this.selectedList);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
