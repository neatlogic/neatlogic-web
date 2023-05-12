<template>
  <div>
    <TsTable
      v-if="tableData"
      v-bind="tableData"
      size="small"
      height="300px"
      :border="false"
      type="card"
    >
      <template v-for="(head,index) in tableData.theadList" :slot="head.key" slot-scope="{ row }">
        <div :key="index">
          <div v-if="head.type == 'string'">
            <TsFormInput v-model="row[head.key]"></TsFormInput>
          </div>
          <div v-else-if="head.type == 'number'">
            <TsFormInput v-model="row[head.key]"></TsFormInput>
          </div>
          <div v-else-if="head.type == 'enum'">
            <TsFormSelect v-model="row[head.key]" :transfer="true" :dataList="formatDataList(head.dataList)"></TsFormSelect>
          </div>
          <div v-else-if="head.key=='_action'">
            <i class="tsfont-trash-o" style="cursor:pointer;margin:0px 10px" @click="removeData(row)"></i>
          </div>
        </div>
      </template>
    </TsTable>
    <div><a href="javascript:void(0)" @click="addData()"><i class="tsfont-plus"></i>添加数据项</a></div>
  </div>
</template>
<script>
import TsTable from '@/resources/components/TsTable/TsTable';//这里需要保留，为了注入样式
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';

export default {
  name: '',
  components: {
    TsFormInput,
    TsFormSelect,
    TsTable
  },
  props: {
    attrData: {type: Object},
    valueList: {type: Array}
  },
  data() {
    return {
      dataList: [{}]
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
    formatDataList(dataList) {
      let finalList = [];
      if (dataList && dataList.length > 0) {
        dataList.forEach(element => {
          finalList.push({value: element, text: element});
        });
      }
      return finalList;
    },
    addData() {
      this.dataList.push({});
    },
    removeData(d) {
      let index = null;
      for (let i = 0; i < this.dataList.length; i++) {
        if (this.dataList[i] == d) {
          index = i;
          break;
        }
      }
      this.dataList.splice(index, 1);
    },
    valid() { //验证数据合法性
      return true;
    }
  },
  filter: {},
  computed: {
    tableData: function() {
      let theadList = [];
      if (this.attrData && this.attrData.config && this.attrData.config.dataList) {
        const width = (100 / this.attrData.config.dataList.length) + '%';
        this.attrData.config.dataList.forEach(element => {
          theadList.push({key: element.name, title: element.label, type: element.type, dataList: element.dataList, width: width});
        });
        theadList.push({key: '_action'});
      }
      return {theadList: theadList, tbodyList: this.dataList};
    },
    headerList: function() {
      if (this.attrData && this.attrData.config && this.attrData.config.dataList) {
        return this.attrData.config.dataList;
      } else {
        return [];
      }
    }
  },
  watch: {
    valueList: {
      handler: function(v) {
        if (v && v.length > 0) {
          if (typeof v[0] == 'string') {
            //从数据库出来的值是字符串，需要还原为数组
            this.dataList = JSON.parse(v[0]);
          } else {
            //ciEntityQueue里的暂存数据是数组，不需要转换
            this.dataList = v[0];
          }
        }
      },
      deep: true,
      immediate: true
    },
    dataList: {
      handler: function(v) {
        this.$emit('setData', [v]);
        this.$emit('setValue', [v]);
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>
