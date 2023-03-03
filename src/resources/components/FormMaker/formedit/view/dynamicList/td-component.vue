<template>
  <div>
    <!-- 自定义数据源 -->
    <template v-if="matrixType != 'external'">
      <template v-if="item">
        <UserCard
          v-if="item.type == 'user'"
          :name="item.text"
          :uuid="item.value"
          :avatar="item.avatar"
          :vipLevel="item.vipLevel"
          :pinyin="item.pinyin"
        ></UserCard>
        <a
          v-else-if="url"
          :href="url"
          class="text-href"
          target="_blank"
          @click.stop
        >{{ getShowText }}</a>
        <template v-else-if="item != 'user'">{{ getShowText }}</template>
      </template>
    </template>

    <!-- 外部数据源 -->
    <template v-else>
      <div v-if="editType && !isReadonly" @click.stop>
        <TsFormSelect
          :value="currentValue"
          v-bind="getSelConfig"
          border="border"
          :readonly="isReadonly"
          :disabled="disabled"
          transfer
          @on-change="changeValue"
        ></TsFormSelect>
      </div>
      <a
        v-else-if="url"
        :href="url"
        class="text-href"
        target="_blank"
        @click.stop
      >{{ getShowText }}</a>
      <template v-else>{{ getShowText }}</template>
    </template>
  </div>
</template>

<script>
import UserCard from '@/resources/components/UserCard/UserCard.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: 'FormdynamicList',
  components: { UserCard, TsFormSelect },
  props: {
    isReadonly: {//只读
      type: Boolean, 
      default: false
    }, 
    item: Object,
    matrixType: String, //矩阵类型
    editType: String, //组件类型 select selects
    value: [String, Array, Number, Boolean], //组件的值
    disabled: {
      type: Boolean, 
      default: false
    },
    url: String
  },
  data() {
    return {
      currentValue: null
    };
  },
  created() {},
  mounted() {
  },
  methods: {
    changeValue(value) {
      this.$emit('on-updata', value);
    }
  },
  computed: {
    getSelConfig() {
      let json = {};
      if (this.editType) {
        json.dataList = this.item && this.item.dataList ? this.item.dataList : [];
        this.editType == 'selects' && (json.multiple = true);
      }
      return json;
    },
    getShowText() {
      let arr = this.item.text;
      if (this.editType && this.value !== null && this.value !== undefined) {       
        arr = [];
        this.item.value &&
          this.item.dataList.forEach(cc => {
            if (typeof this.value == 'string' && cc.value == this.value) { //单选
              arr.push(cc.text);
            } else if (typeof this.value == 'object' && this.value.indexOf(cc.value) >= 0) { //多选
              arr.push(cc.text);
            }
          });
        arr = arr.join(',');
      } else if (typeof this.value == 'boolean') {
        arr = JSON.stringify(arr);
      }
      if (Array.isArray(arr)) {
        arr = arr.join(',');
      }
      return arr || '-';
    }
  },
  watch: {
    value: {
      handler(val) {
        if (!this.editType) {
          return;
        }
        if (val === null || val === undefined) {
          this.editType == 'selects' && (this.currentValue = [this.item.dataList[0].value]);
          this.editType == 'select' && (this.currentValue = this.item.dataList[0].value);
        } else {
          this.currentValue = val;
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
