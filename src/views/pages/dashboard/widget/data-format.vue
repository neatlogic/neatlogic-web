<template>
  <div style="height: 100%; line-height: 46px; position: relative;">

    <Loading
      v-if="isLoading"
      :loading-show="isLoading"
      class="loadingclass"
      type="fix"
    ></Loading>
    <div v-else-if="dataFormatList && dataFormatList.length">
      <Row
        v-for="item in dataFormatList"
        :key="item.name + item.uuid"
        :gutter="8"
        :class="[{ 'ivu-form-item-required': item.isRequire }, {'ishide': !item.isShow}]"
      >
        <Col span="4" class="ivu-form-item-label">{{ item.displayName }}</Col>
        <Col :span="item.formHandlerType === 'radio' ? 20 : 8">
          <div v-if="item.name === 'color'">
            <div
              v-for="color in item.dataList"
              :key="color.value"
              class="colorBlock"
              :style="{ backgroundColor: color.value }"
              @click="colorHandler(color, item)"
            >
              <i v-if="item.value === color.value" class="icon tsfont-check text-op"></i>
            </div>
          </div>
          <div 
            :is="'form' + item.formHandlerType" 
            v-else 
            v-model="item.value" 
            transfer 
            :multiple="item.isMulti" 
            :dataList="item.dataList" 
            :clearable="!item.isRequire"
            width="100%" 
            @on-change="formchange(item)"
          ></div>
        </Col>
        <Col v-if="item.subConfig" span="1"></Col>
        <Col v-if="item.subConfig && item.subConfig.handler" span="10">
          <div 
            :is="'form' + item.subConfig.handler" 
            :key="item.value" 
            v-model="item.subValue" 
            v-bind="item.subConfig" 
            :dataList="item.subConfig.dataList" 
            :multiple="itemSubIsMulti" 
            transfer 
            width="100%" 
            @on-change="(val)=>{formchange(item, 'subConfig','subValue',val)}"
          ></div>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import items from './handler.js';
export default {
  name: 'DataFormat',
  components: {
    ...items
  },
  filters: {},
  props: ['editAdd', 'dataFormConfig', 'chartConfig'], 
  // editAdd 编辑或添加, dataFormConfig  格式展示数据列表，请求接口的时候，用来做较验
  data() {
    return {
      isLoading: false,
      dataFormatList: [],
      formatResult: {},
      groupOptionList: [],
      groupfield: null,
      subgroupfield: null,
      colorValue: '',
      itemSubConfig: '',
      itemSubIsMulti: false,
      initChartConfig: null,
      isBack: true,
      isClear: false //是否需要清空默认值（初始化分为2种，一个是切换分类的时候需要清空原来的配置，一个是配置了之后第一次打开需要用原来的配置）
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
    colorHandler(color, item) {
      this.colorValue = color.value;
      item.value = color.value;
      this.formchange(item);
    },
    clearConfig() {
      if (this.editAdd === 'add' && this.isBack) {
        this.$emit('backtotick');
        this.isBack = false; // 只执行一次
      }
      this.isClear = false;
    },
    chartConfigEcho(chartconfig, type) {
      //
      this.initChartConfig = chartconfig;
      this.isClear = true;
      if (this.dataFormatList && this.dataFormatList.length) {
        this.dataFormatList.forEach(d => {
          if (d.name && chartconfig[d.name]) {
            Object.assign(d, {value: chartconfig[d.name]});
          } else if (d.subConfig && chartconfig[configlist]) { 
            Object.assign(d, {subValue: chartconfig[d.name]}); 
          }
        });
      }
      // 触发preview回显
      // this.$emit('formatDataChange', { chartConfig: chartconfig }, 1111111);
    },
    changeChartType(chartType, handler) {
      if (!chartType) return;
      if (chartType === this.chartType) return;
      this.isLoading = true;
      this.chartType = chartType;

      this.$api.dashboard.dashboard.widgetShowConfigGet({chartType: chartType.value, handler: handler}).then(res => {
        this.isLoading = false;
        if (res.Status === 'OK') {
          this.dataFormatList.splice(0);
          const dataList = res.Return.showConfig;
          this.dataFormatList.push(
            ...dataList.map(d => {
              d.isActive = false;
              d.isRequire = true;
              d.isShow = true;
              if (d.name === 'groupfield') {
                this.groupfield = d;
                //} else if (d.name === 'subgroupfield') {
              } else if (d.name === 'subgroupfield') {
                this.subgroupfield = d;
                d.isRequire = false;
              }
              // 添加默认值
              d.value = d.isMulti ? [] : '';
              const defaultValue = d.dataList.find(a => a.isDefault);
              if (defaultValue) {
                if (Array.isArray(d.value)) {
                  d.value.push(defaultValue.value);
                } else {
                  d.value = defaultValue.value;
                }
              }
              // 添加回显值()
              if (this.initChartConfig && this.isClear) {
                if (this.initChartConfig.hasOwnProperty(d.name)) {
                  d.value = this.initChartConfig[d.name];
                }
                if (d.name === 'groupfield' && this.initChartConfig['configlist']) {
                  d.subValue = this.initChartConfig['configlist'];
                }
              }
              // 添加uuid，防止key报错
              d.uuid = this.$utils.setUuid();
              return d;
            })
          );
          this.dataFormatList.forEach(d => {
            // 组件联动
            this.formchange(d, 'defaultValue', this.initChartConfig);
          });
          this.clearConfig();
          //this.initChartConfig = null;
        }
      }).catch(e => {
        this.isLoading = false;
        this.clearConfig();
      });
    },
    formchange(item, action, key, value) {
      //20210118_用于修复二级下拉改变值没有回显回去value,单独存了需要修复的字段，避免其他调用的地方多的参数
      let fixValueList = ['subValue'];
      if (key && fixValueList.includes(key) && action == 'subConfig') {
        let newobj = {};
        newobj[key] = value;
        item = Object.assign(item, newobj);
      }
      const result = {};
      if (this.groupfield && this.subgroupfield) {
        if (item.name === 'groupfield') {
          let arr = [];
          if (Array.isArray(item.value)) {
            arr = item.value;
          } else if (item.value) {
            arr = [item.value];
          } else if (this.subgroupfield.spliceList) {
            this.subgroupfield.dataList.push(...this.subgroupfield.spliceList.splice(0));
          }
          arr.forEach(d => {
            if (!this.subgroupfield.spliceList) this.subgroupfield.spliceList = [];
            const aa = this.subgroupfield.dataList.findIndex(d => {
              return d.value === item.value;
            });
            if (aa !== -1) this.subgroupfield.spliceList.push(...this.subgroupfield.dataList.splice(aa, 1));
          });
          if (this.subgroupfield.spliceList) {
            for (let i = 0; i < this.subgroupfield.spliceList.length; i++) {
              const is = arr.some(d => {
                return d === this.subgroupfield.spliceList[i].value;
              });
              if (!is) {
                this.subgroupfield.dataList.push(...this.subgroupfield.spliceList.splice(i, 1));
                i--;
              }
            }
          }
        } else if (item.name === 'subgroupfield') {
          let arr = [];
          if (Array.isArray(item.value)) {
            arr = item.value;
          } else if (item.value) {
            arr = [item.value];
          } else if (this.groupfield.spliceList) {
            this.groupfield.dataList.push(...this.groupfield.spliceList.splice(0));
          }
          arr.forEach(d => {
            const aa = this.groupfield.dataList.findIndex(d => {
              return d.value === item.value;
            });
            if (!this.groupfield.spliceList) this.groupfield.spliceList = [];
            if (aa !== -1) this.groupfield.spliceList.push(...this.groupfield.dataList.splice(aa, 1));
          });
          if (this.groupfield.spliceList) {
            for (let i = 0; i < this.groupfield.spliceList.length; i++) {
              const is = arr.some(d => {
                return d === this.groupfield.spliceList[i].value;
              });
              if (!is) {
                this.groupfield.dataList.push(...this.groupfield.spliceList.splice(i, 1));
                i--;
              }
            }
          }
        }
      }
      // 是否多选判断
      if (item.name === 'type') {
        if (item.value === 'single') {
          this.itemSubIsMulti = false;
        } else if (item.value === 'many') {
          this.itemSubIsMulti = true;
        }
      }
      // 不是二级联动的，需要清空一次之前的二级联动数据
      if (action != 'subConfig') {
        const type = this.dataFormatList.find(d => d.name === 'type');
        const subconfig = item.dataList.find(d => item.value === d.value);
        if (!item.subConfig || subconfig.config !== item.subConfig) {
          if (subconfig && subconfig.config && subconfig.config.handler) {
            this.$set(item, 'subConfig', subconfig.config);
            if (item.subConfig.handler === 'userselect') {
              // item.subConfig.config = {
              //   groupList: ['user']
              // };

              item.subConfig.excludeList = item.subConfig.initConfig.excludeList;
              item.subConfig.groupList = item.subConfig.initConfig.groupList;
              item.subConfig.includeList = item.subConfig.initConfig.includeList;
            }
            if (item.subConfig.url) {
              item.subConfig.config = {
                ...item.subConfig,
                url: item.subConfig.url,
                textName: item.subConfig.mapping.text,
                valueName: item.subConfig.mapping.value,
                multiple: this.itemSubIsMulti
              };
            }
            //this.itemSubIsMulti = !!(item.subConfig && item.subConfig.multiple);
            if (this.itemSubIsMulti) {
              //
              item.subValue = [];
            }
            if (!this.itemSubIsMulti) {
              //
              item.subValue = '';
            }
          } else {
            this.$set(item, 'subConfig', null);
            this.$set(item, 'subValue', '');
            delete item.subConfig;
            delete item.subValue;
          }
        }
        if (item.name === 'subgroupfield') {
          this.dataFormConfig.subgroupfieldValue = null;
          this.dataFormConfig.subgroupfieldValue = this.$utils.deepClone(item.value);
          item.value = '';
          if (this.editAdd === 'edit' && this.isBack) {
            this.$nextTick(() => {
              this.isBack = false;
            });
            item.value = this.$utils.deepClone(this.dataFormConfig.subgroupfieldValue); 
          }
        }
        
        if (this.isBack && this.editAdd === 'edit') {
          if (this.chartConfig.type === 'many') {
            this.$nextTick(() => {
              this.isBack = false;
            });
            // 主要解决值图回显问题
            if (typeof this.chartConfig.configlist == 'object') {
              this.itemSubIsMulti = true;
            }
            this.dataFormatList.forEach(v => {
              if (v.name === 'type') {
                v.value = this.chartConfig.type;
              }
              if (v.name === 'groupfield') {
                v.value = this.chartConfig.groupfield;
                v.subValue = this.chartConfig.configlist;
              }
            });
          }
          if (item.name === 'refeshtime' && this.chartConfig.refeshtime) {
            item.value = this.chartConfig.refeshtime;
          }
        }

        // //   //
        this.dataFormatList.forEach(d => {
          if (d.subConfig) {
            if (Array.isArray(d.subValue) && d.subValue.length) {
              if (!this.itemSubIsMulti) {
                //
                d.subValue = d.subValue[0];
              }
            } else if (d.subValue && !Array.isArray(d.subValue)) {
              if (this.itemSubIsMulti) {
                //
                d.subValue = [d.subValue];
              }
            }
            if (this.itemSubIsMulti && !d.subValue) {
              //
              d.subValue = [];
            }
            if (!this.itemSubIsMulti && !d.subValue) {
              //
              d.subValue = '';
            }
          } else {
            //
          }
        });
      }
      //如果是初始化值的
      if (action === 'defaultValue') {
        if (item.subConfig && this.initChartConfig.configlist) {
          if (this.initChartConfig.type === 'single') {
            item.subValue = this.initChartConfig.configlist[0];
          } else {
            item.subValue = this.initChartConfig.configlist;
          }
        }
      } else {
        // 切换聚合模式的时候，清空二级分组的数据
        if (item.name === 'aggregate') {
          this.dataFormatList.forEach(v => {
            if (v.name === 'subgroupfield' && !v.isShow) {
              v.value = '';
            }
          });
        }
        if (item.name === 'groupfield' && (this.chartConfig && this.chartConfig.type === 'many')) {
          this.chartConfig.configlist = item.subValue;
        }
      }
      //全部渲染完再对应回填数据
      this.dataFormatList.forEach(d => {
        result[d.name] = d.value;
        if (d.name === 'color') result[d.name] = this.colorValue;
        d.isShow = true;
        if (d.subConfig) {
          if (d.subValue && !Array.isArray(d.subValue)) {
            result['configlist'] = [d.subValue];
          } else if (Array.isArray(d.subValue)) {
            result['configlist'] = d.subValue;
          } else if (!d.subValue) {
            result['configlist'] = [];
          }
        }
      });

      // 是否显示二级分组
      let isHasSubGroup = true;
      if (this.dataFormatList.length > 0 && result.aggregate) {
        Object.keys(result).forEach(n => {
          this.dataFormatList.forEach(v => {
            if (v.name === 'aggregate') {
              v.dataList.forEach(t => {
                if (t.value === result[n]) {
                  if (t.isHasSubGroup === 0) {
                    isHasSubGroup = false;
                    // 为0的时候不显示，其它条件都要显示
                  } else {
                    isHasSubGroup = true;
                  }
                }
              });
            }
          });
        });

        this.dataFormatList.forEach(v => {
          if (v.name === 'subgroupfield') {
            v.isShow = isHasSubGroup;
          }
        });
      }
      this.formatResult = result;
      if (action === 'defaultValue') {
        return;
      }
      this.dataFormConfig.list = this.dataFormatList;
      // // 判断是否存在为空
      this.$emit('formatDataChange', result);
    },
    validData() {
      let is = false;
      this.dataFormatList.forEach(d => {
        if (d.hasOwnProperty('isRequire') && !d.isRequire) {
          return false;
        }
        if (Array.isArray(d.value) && d.value.length === 0) {
          is = true;
        } else if (!d.value) {
          is = true;
        }
        if (d.subValue) {
          if (Array.isArray(d.subValue) && d.subValue.length === 0) {
            is = true;
          }
        } else if (d.subConfig) {
          is = true;
        }
      });
      if (is) {
        return {
          valid: false,
          msg: this.$t('term.dashboard.conditionisnull')
        };
      } else {
        return {
          valid: true,
          msg: ''
        };
      }
    },
    getData(action) {
      let result = {};
      if (action === 'init') {
        result = this.initChartConfig;
      } else {
        this.dataFormatList.forEach(d => {
          result[d.name] = d.value;
          if (d.subConfig) {
            if (d.subValue && !Array.isArray(d.subValue)) {
              result['configlist'] = [d.subValue];
            } else if (Array.isArray(d.subValue)) {
              result['configlist'] = d.subValue;
            } else if (!d.subValue) {
              result['configlist'] = [];
            }
          }
        });
      }
      return result;
    }
  },
  computed: {
    // setConfig() {
    //   return function(config) {
    //     let conf = {};
    //     if (config) {
    //       console.log(config);
    //       Object.assign(conf, config);
    //     }
    //     return conf;
    //   };
    // }
  },
  watch: {}
};
</script>

<style lang="less" scoped>
.colorBlock {
  width: 26px;
  height: 26px;
  display: inline-block;
  margin-right: 20px;
  background-color: #00b83f;
  cursor: pointer;
  text-align: center;
  line-height: 26px;
  font-size: 16px;
}
.ishide{
  display: none;
}
.ivu-form-item-label:before{
    top: 50% !important;
    margin-top: -7px;
    height: 14px;
    line-height: 14px;
}
</style>
