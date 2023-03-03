<template>
  <div class="selectContent dataSource">
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">不可选择</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.dataSource" class="col-2" @on-change="changeDataSource">
          <Radio label="knowledgeType">根节点</Radio>
        </RadioGroup>
      </div>
    </div>
    
    <div>
      <div class="formsetting-block">
        <label class="formsetting-label text-grey require-label label-switch">数据源
          <!-- <span class="label-right" style="top: 0px;">
            <i
              v-if="setting.matrixUuid"
              class="tsfont-edit text-tip-active"
              title="数据源"
              @click="addDataSource(setting.matrixUuid)"
            ></i>
            <i class="ts-refresh text-tip-active" title="刷新数据源" @click="refreshDataSource()"></i>
          </span> -->
        </label>
        <div class="formsetting-text">
          <TsFormSelect
            ref="matrixUuid"
            v-model="curName.value"
            v-bind="matrixJson"
            :validateList="validJson"
            :transfer="true"
            :selectItemList.sync="dataSourceJson"
            @on-change="changeMatrix"
          >
            <!-- <template v-slot:first-ul>
              <li class="tsfont-plus text-href first-slot" @click="addDataSource()">数据源</li>
            </template> -->
            <template v-slot:handlerName="{item}">
              <div>{{ item }}<span class="text-grey cen-align">({{ item }})</span></div>
            </template>
          </TsFormSelect>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: 'DataSource',
  components: {
    TsFormSelect
  },
  props: {
    setting: Object,
    uuid: String,
    level: {
      type: [Number, String],
      default: 1
    }
  },

  data() {
    let _this = this;
    return {
      curName: {
        value: '',
        transfer: false,
        multiple: false,
        url: '',
        params: {},
        search: false,
        rootName: 'children',
        valueName: 'uuid',
        textName: 'name',
        keyword: 'keyword',
        dataList: [],
        readonly: false,
        disabled: false,
        childrenKey: 'children',
        className: '',
        readonlyClass: '',
        validateList: [],
        width: '100%',
        placeholder: '请选择下拉树菜单',
        clearable: true,
        selectLastLevel: true,
        showPath: true,
        sperateText: '>',
        onChange: function(val) {
          // console.log(val, '=====', _this.curName);
        }
      },
      dataSourceJson: null, //选中数据源的object数据
      showBatchedit: false, //是否显示批量编辑弹窗
      validJson: ['required'],
      childDataList: [],
      level2List: [],
      leveValue1: '',
      // leveValue2: '',
      tabValue: 'level1',
      tabMappingValue: 'mapping1',
      matrixJson: {
        dynamicUrl: '/api/rest/form/treeselect/handler/list',
        textName: 'handlerName',
        validateList: ['required'],
        errorMessage: '',
        dealDataByUrl(list) {
          list.forEach(item => {
            item.value = item.config.url;
          });
          return list;
        }
      },
      mappingDataList: []
    };
  },
  created() {},
  mounted() {
  },
  destroyed() {},
  methods: {
    changeDataSource() {
      //改变数据源
    },
    changeMatrix(refresh, val, nodeData) { //用来校验矩阵的有效性
      let _this = this;      

      if (nodeData.handler) {
        _this.setting.dataSource = nodeData.handler;
      }
      // console.log(_this.setting, '过来了****', refresh, val, nodeData);
      
      let json = {isActive: 1};
      if (refresh) {
        _this.setting.url = refresh;
      } else {
        _this.setting.url = '';
        _this.setting.value = '';
      }

      this.$forceUpdate();
    },
    changeDefaultValue(level) {
      this.$emit('changeDefaultValue', level);
    },
    // addDataSource(dataSourceId) {
    //   //添加编辑数据源入口
    //   if (dataSourceId) {
    //     let path = this.dataSourceJson.type == 'external' ? '/matrix-external-edit' : '/matrix-edit';
    //     window.open(HOME + '/framework.html#' + path + '?uuid=' + this.dataSourceJson.uuid + '&name=' + this.dataSourceJson.name + '&type=' + this.dataSourceJson.type, '_blank');
    //   } else {
    //     window.open(HOME + '/framework.html#/matrix-overview?atrixFormDialogShow=true', '_blank');
    //   }
    // },
    refreshDataSource() {
      //刷新数据源
      this.matrixJson.dynamicUrl = '/api/rest/form/treeselect/handler/list?refuuid' + this.$utils.setUuid();
      _this.setting.url = '';
      _this.setting.value = '';
      this.$Message.success('刷新成功');
    },
    validComponent() {
      let _this = this;
      let componet = [{ ref: 'matrixUuid', message: '数据源:不可为空' }];
      let validList = [];
      componet.forEach(item => {
        _this.$refs[item.ref] && !_this.$refs[item.ref].valid() && validList.push('数据源:' + _this.$refs[item.ref].validMesage);
      });
      validDataList(_this.curName.dataList, '', _this.setting.mapping);
      delete _this.setting.matrixUuid;
      delete _this.setting.matrixType;
      return validList;
    }

  },
  computed: {},
  watch: {
    dataSourceJson: {
      handler(val) {
        if (val) {
          this.setting.config = val.config;
        } else {
          this.setting.config = {};
        }
        this.$emit('changeDefaultValue');
      },
      immediate: true,
      deep: true
    }
  }
};

function getDefaultValue(list, value, index) {
  //判断是否有重复数据
  let isDefaultValue = true;
  for (let i = 0; i < list.length; i++) {
    if (typeof index != 'undefined' && index != i && list[i].value == value) {
      isDefaultValue = false;
      break;
    } else if (typeof index == 'undefined' && list[i].value == value) {
      isDefaultValue = false;
      break;
    }
  }
  return isDefaultValue;
}
function validDataList(dataList, parent) {
  let validList = [];
  let hasNull = false;
  if (!dataList) {
    return validList;
  }
  for (let a = 0; a < dataList.length;) {
    let item = dataList[a];
    item.index = parent ? (parent.index + 1) : 1;
    if (item.index > 1 && item.value == '' && item.text == '') { //其他层级可以两个同时为空
      dataList.length > 1 && dataList.splice(a, 1);
      if (dataList.length == 1) {
        break;
      }
      continue;
    }
    if (item.value == '' && !hasNull) {
      hasNull = true;
      validList.push('静态数据源：' + item.index + '级值为' + (parent ? parent.text : '') + '的子集，值不可以为空');
    }
    if (item.text == '' && !hasNull) {
      hasNull = true;
      validList.push('静态数据源：' + item.index + '级值为' + (parent ? parent.text : '') + '的子集，显示值不可以为空');
    }
    if (item.isDefaultValue) {
      //默认选中数据处理
      val.push(item.value);
    }
    item.children && validList.push.apply(validList, validDataList(item.children, item));
    a++;
  }
  return validList;
}

</script>
<style lang="less" scope>
.noBlock {
  display: none;
}
.cen-align{
  vertical-align: baseline;
  margin-left: 3px;
}
</style>
