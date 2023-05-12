<template>
  <div>
    <div class="jquery-quartz-container" :class="{ 'quartz-show': showType != 'edit' }">
      <div v-for="(controller, index) in controllerList" :key="index" class="cron-controller">
        <Poptip
          v-if="showType === 'edit' && controller.type !== 'label'"
          :width="controller.datasource === 'controller' ? null : 475"
          :value="isVisible(controller.datasource)"
          trigger="click"
          :transfer="transfer"
          @on-popper-hide="datasourceVisibleMap[controller.datasource] = false"
        >
          <div class="jquery-quartz-controller-text cursor ml-xs" @click.stop="showPoptip(controller.datasource)">
            <span v-if="controller.datasource === 'controller'" class="pl-xs">{{ Setting.dict[tmpCronType || (!tmpCronType && cronType)] }}</span>
            <span v-else class="pl-xs">{{ getCronDataValueName(controller) }}</span>
          </div>
          <div slot="content" tabindex="-1" @blur="closePoptip(controller)">
            <div
              v-for="(item, itemindex) in Setting[controller.datasource]"
              :key="itemindex"
              :class="{ selected: isItemSelected(controller, item) }"
              class="cursor jquery-quartz-dropdown-item"
              @click="selectItem(controller, item)"
            >
              {{ Setting.dict[item] || item }}
            </div>
          </div>
        </Poptip>
        <div v-else-if="showType === 'read' && controller.type !== 'label'">
          <span v-if="controller.datasource === 'controller'" class="pl-xs">{{ Setting.dict[tmpCronType || (!tmpCronType && cronType)] }}</span>
          <span v-else :class="getCronDataValueName(controller) ? 'pl-xs' : ''">{{ getCronDataValueName(controller) }}</span>
        </div>
        <div v-else-if="controller.type === 'label'">
          <span class="pl-xs">{{ controller.text }}</span>
        </div>
      </div>
    </div>
    <div v-if="desc && !descType" class="text-tip tips">{{ desc }}</div>
    <Alert v-else-if="desc && descType" :type="descType">{{ desc }}</Alert>
  </div>
</template>
<script>
import './quartz.less';
import formMixins from '@/resources/mixins/formMixins.js';
import Setting from './quartz-setting';

export default {
  name: 'TsQuartz',
  components: {},
  mixins: [formMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    transfer: { type: Boolean, default: true },
    value: String,
    showType: {
      default: 'edit',
      String: String
    },
    config: Object,
    desc: String,
    onChange: Function //改变时触发
  },
  data() {
    return {
      datasourceVisibleMap: {
        controller: false,
        hour: false,
        minute: false,
        month: false,
        dayofweek: false,
        dayofmonth: false
      },
      Setting: Setting,
      tmpCronType: null, //临时的类型，用于编辑过程中改变crontype
      cronData: {
        second: '0',
        minute: '*',
        hour: '*',
        dayofmonth: '*',
        month: '*',
        dayofweek: '?',
        year: '*'
      },
      cronStr: ''
    };
  },
  mounted() {},
  destroyed() {},
  created() {},
  methods: {
    closePoptip(controller) {
      this.datasourceVisibleMap[controller.datasource] = false;
    },
    isItemSelected(controller, item) {
      if (controller.datasource === 'controller') {
        return this.tmpCronType === item || (!this.tmpCronType && this.cronType === item);
      } else {
        const v = this.cronData[controller.datasource];
        const vList = v.split(',');
        return vList.includes(item);
      }
    },
    isVisible(datasource) {
      return this.datasourceVisibleMap[datasource];
    },
    showPoptip(datasource) {
      if (!this.datasourceVisibleMap[datasource]) {
        for (let key in this.datasourceVisibleMap) {
          if (this.datasourceVisibleMap[key]) {
            this.datasourceVisibleMap[key] = false;
          }
        }
        this.datasourceVisibleMap[datasource] = true;
      } else {
        this.datasourceVisibleMap[datasource] = false;
      }
    },
    getCronDataValueName(controller) {
      const v = this.cronData[controller.datasource];
      const vList = v.split(',');
      const nList = [];
      vList.forEach(element => {
        nList.push(this.Setting.dict[element] || element);
      });
      return nList.join(',');
    },
    selectItem(controller, item) {
      if (controller.get === 'type') {
        this.tmpCronType = item;
        for (let key in this.cronData) {
          //秒需要保持是0
          if (key != 'second' && !this.Setting.controllerList[item].find(d => d.datasource && d.datasource === key)) {
            this.$set(this.cronData, key, '*');
            if (key === 'dayofweek') {
              this.$set(this.cronData, 'dayofmonth', '?');
            } else if (key === 'dayofmonth') {
              this.$set(this.cronData, 'dayofweek', '?');
            }
          }
        }
        this.datasourceVisibleMap[controller.datasource] = false;
      } else if (controller.get === 'value') {
        let v = this.cronData[controller.datasource];
        if (v === '*' || v === '?') {
          v = item;
        } else if (v) {
          const vList = v.split(',');
          const index = vList.findIndex(d => d === item);
          if (index > -1) {
            vList.splice(index, 1);
          } else {
            vList.push(item);
          }
          if (vList.length > 0) {
            v = vList.join(',');
          } else {
            v = '*';
          }
        }

        if (controller.datasource === 'dayofmonth') {
          this.$set(this.cronData, 'dayofweek', '?');
        } else if (controller.datasource === 'dayofweek') {
          this.$set(this.cronData, 'dayofmonth', '?');
        }
        this.$set(this.cronData, controller.datasource, v);
      }
    },
    validField: function(field, value) {
      if (this.Setting[field]) {
        const checkValueList = new Array();
        if (value && (value.indexOf(',') > -1 || value.indexOf('-') > -1)) {
          let vs = new Array();
          if (value.indexOf(',') > -1) {
            vs = value.split(',');
          } else {
            vs.push(value);
          }
          for (let i = 0; i < vs.length; i++) {
            if (vs[i].indexOf('-') > -1) {
              let s = parseInt(vs[i].split('-')[0], 10);
              let e = parseInt(vs[i].split('-')[1], 10);
              checkValueList.push(s);
              checkValueList.push(e);
            } else {
              checkValueList.push(vs[i]);
            }
          }
        } else {
          checkValueList.push(value);
        }
        for (let i = 0; i < this.Setting[field].length; i++) {
          for (let d = 0; d < checkValueList.length; d++) {
            if (checkValueList[d] == this.Setting[field][i]) {
              return true;
            }
          }
        }
      }
      return false;
    },
    init() {
      const times = (this.value && this.value.split(' ')) || [];
      let index = 0;
      for (let key in this.cronData) {
        if (times && times.length > 0 && this.validField(key, times[index])) {
          this.cronData[key] = times[index];
        } else {
          if (index === 0) {
            this.cronData[key] = 0;
          } else if (times[index] === '?' || times[index] === '*') {
            this.cronData[key] = times[index];
          } else {
            this.cronData[key] = '*';
          }
        }
        index += 1;
      }
      //修正最后的cron表达式，dayofmonth和dayofweek不能同时为*或？
      if (this.cronData.dayofweek === '*' && this.cronData.dayofmonth === '*') {
        this.cronData.dayofweek = '?';
      }
    }
  },
  computed: {
    controllerList() {
      return this.Setting.controllerList[this.tmpCronType || this.cronType];
    },
    cronType() {
      if (this.cronData.month != '*') {
        return 'year';
      } else if (this.cronData.dayofmonth != '*' && this.cronData.dayofmonth != '?') {
        return 'month';
      } else if (this.cronData.dayofweek != '*' && this.cronData.dayofweek != '?') {
        return 'dayofweek';
      } else if (this.cronData.hour != '*') {
        return 'dayofmonth';
      } else if (this.cronData.minute != '*') {
        return 'hour';
      } else {
        return 'minute';
      }
    }
  },
  watch: {
    value: {
      handler: function(val) {
        if (val) {
          if (val !== this.cronStr) {
            this.init();
          }
        } else {
          const vList = [];
          for (let k in this.cronData) {
            vList.push(this.cronData[k]);
          }
          const vs = vList.join(' ');
          this.$emit('input', vs);
          this.$emit('change', vs);
          this.onChange && this.onChange(vs);
        }
      },
      deep: true,
      immediate: true
    },
    cronData: {
      handler: function(val) {
        const vList = [];
        for (let k in val) {
          vList.push(val[k]);
        }
        const vs = vList.join(' ');
        this.$emit('input', vs);
        this.$emit('change', vs);
        this.onChange && this.onChange(vs);
        this.cronStr = vs;
      },
      deep: true
    },
    config: {
      handler: function(val) {
        console.log(val);
      },
      deep: true
    }
  }
};
</script>
<style scoped>
.cron-controller {
  display: inline-block;
}
</style>
