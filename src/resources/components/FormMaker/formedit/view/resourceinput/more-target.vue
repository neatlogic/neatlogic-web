<template>
  <TsDialog
    type="modal"
    :isShow="visible"
    v-bind="dialogConfig"
    height="400px"
    :hasMask="hasMask"
    @on-close="close()"
  >
    <div class="input-border" style="text-align: right;">
      <Input
        v-model="keyword"
        style="width:240px"
        search
        placeholder="请输入ip"
        @on-search="filterData"
      />
    </div>
    <div style="padding-top:16px">
      <TsRow :gutter="10">
        <template v-for="(data,index) in currentDataList">
          <Col
            v-if="!data._isHidden"
            :key="index"
            :span="8"
          >
            <div class="item bg-op border-color overflow" :title="targetText(data)">
              {{ targetText(data) }} 
              <i v-if="!isReadonly" class="remove tsfont-close text-grey" @click="removeItem(index)"></i>
            </div>
          </Col>
        </template>  
      </TsRow>
      <NoData v-if="searchList.length == 0"></NoData>
    </div>
    <template v-slot:footer>
      <template v-if="!isReadonly">
        <Button type="primary" ghost @click.native="onOk('removeAll')">全部清空</Button>
        <Button type="primary" @click="onOk('save')">确定</Button>
      </template>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
  },
  model: {
    prop: 'visible',
    event: 'change'
  },
  filtes: {},
  props: {
    isReadonly: {
      type: Boolean,
      default: false
    },
    visible: {
      default: false
    },
    dataList: {
      type: Array
    },
    hasMask: {
      type: Boolean,
      default: true
    }
  },
  data() {
    let _this = this;
    return {
      dialogConfig: {
        title: this.$t('page.viewall'),
        hasFooter: !_this.isReadonly,
        maskClose: _this.isReadonly
      },
      keyword: '',
      checkAll: false,
      showDialog: true,
      currentDataList: [],
      searchList: []
    };
  },
  beforeCreate() {},
  created() {
    this.searchList = this.dataList;
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
    onOk(type) {
      this.keyword = '';
      if (type) {
        if (type == 'removeAll') { //清空所有
          this.$emit('on-ok', []);
        } else if ('save') { //保存
          let list = this.currentDataList.filter(item => delete item._isHidden);
          this.$emit('on-ok', list);
        }
      }
    },
    removeItem(index) {
      this.currentDataList.splice(index, 1);
    },
    batchRemove() {
      this.currentDataList = this.currentDataList.filter(item => {
        return !item._isSelect;
      });
    },
    filterData() {
      let searchList = [];
      let _this = this;
      this.currentDataList.forEach(item => {
        let nameStr = _this.targetText(item);
        this.$set(item, '_isHidden', _this.keyword ? !nameStr.includes(_this.keyword) : false);
        if (nameStr.includes(_this.keyword)) {
          searchList.push(item);
        }
      });
      this.searchList = searchList;
    },
    close() {
      this.$emit('on-ok');
    }
  },
  computed: {
    targetText() {
      return data => {
        return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
      };
    }
  },
  watch: {
    dataList: {
      handler(val) {
        this.currentDataList = [].concat(val || []);
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
.item{
  width: 100%;
  margin-bottom: 10px;
  display: inline-block;
  position: relative;
  height: 32px;
  line-height: 30px;
  padding: 0 4px;
  border: 1px solid;
  text-align: center;
  border-radius: 4px;
  .remove {
    position: absolute;
    right: 0px;
    top: 0px;
    width: 16px;
    height: 16px;
    line-height: 16px;
    display: none;
    cursor: pointer;
  }
  &:hover{
    .remove {
      display: block;
    }
  }
}
.batchRemove{
  // margin-left: 16px;
}
</style>
