<template>
  <TsDialog
    type="modal"
    v-bind="dialogConfig"
    height="400px"
    @on-close="close()"
  >
    <div class="input-border" style="text-align: right;">
      <Input
        v-model="keyword"
        style="width:240px"
        search
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
            <div class="item bg-op border-color overflow" :title="showLabel(data)">
              {{ showLabel(data) }} 
              <i v-if="!disabled" class="remove tsfont-close text-grey" @click="removeItem(index)"></i>
            </div>
          </Col>
        </template>  
      </TsRow>
      <NoData v-if="searchList.length == 0"></NoData>
    </div>
    <template v-slot:footer>
      <template v-if="!disabled">
        <Button type="primary" ghost @click.native="onOk('removeAll')">{{ $t('page.clear') }}</Button>
        <Button type="primary" @click="onOk('save')">{{ $t('page.confirm') }}</Button>
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
    disabled: {
      type: Boolean,
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
    return {
      dialogConfig: {
        isShow: true,
        title: this.$t('page.viewall'),
        hasFooter: !this.disabled,
        maskClose: this.disabled
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
          this.$emit('close', []);
        } else if ('save') { //保存
          let list = this.currentDataList.filter(item => delete item._isHidden);
          this.$emit('close', list);
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
      this.currentDataList.forEach(item => {
        let nameStr = this.showLabel(item);
        this.$set(item, '_isHidden', this.keyword ? !nameStr.includes(this.keyword) : false);
        if (nameStr.includes(this.keyword)) {
          searchList.push(item);
        }
      });
      this.searchList = searchList;
    },
    close() {
      this.$emit('close');
    }
  },
  computed: {
    showLabel() {
      return data => {
        let label = data.name || '';
        if (data.ip) {
          label += '[' + data.ip + ']';
        }
        return label;
      };
    }
  },
  watch: {
    dataList: {
      handler(val) {
        this.currentDataList = this.$utils.deepClone(val) || [];
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
</style>
