<template>
  <TsForm :item-list="form" labelPosition="top">
    <template v-slot:name>
      <div>
        <div v-for="(n, index) in data.name" :key="index" class="grid mb-xs">
          <div>
            <TsFormInput
              :value="n"
              border="border"
              maxlength="20"
              @on-change="
                val => {
                  $set(data.name, index, val);
                }
              "
            ></TsFormInput>
          </div>
          <div><span class="tsfont-close cursor" @click="removeItem('name', index)"></span></div>
        </div>
        <div><a @click="addItem('name')">增加一行</a></div>
      </div>
    </template>
    <template v-slot:attributes>
      <div>
        <div v-for="(attr, index) in data.attributes" :key="index" class="grid mb-xs">
          <div>
            <TsFormInput
              :value="attr"
              border="border"
              maxlength="20"
              @on-change="
                val => {
                  $set(data.attributes, index, val);
                }
              "
            ></TsFormInput>
          </div>
          <div><span class="tsfont-close cursor" @click="removeItem('attributes', index)"></span></div>
        </div>
        <div><a @click="addItem('attributes')">增加一行</a></div>
      </div>
    </template>
    <template v-slot:methods>
      <div>
        <div v-for="(method, index) in data.methods" :key="index" class="grid mb-xs">
          <div>
            <TsFormInput
              :value="method"
              border="border"
              maxlength="20"
              @on-change="
                val => {
                  $set(data.methods, index, val);
                }
              "
            ></TsFormInput>
          </div>
          <div><span class="tsfont-close cursor" @click="removeItem('methods', index)"></span></div>
        </div>
        <div><a @click="addItem('methods')">增加一行</a></div>
      </div>
    </template>
  </TsForm>
</template>
<script>
import { ConfigBase } from '@/views/pages/diagram/diagram/widget-config/config-base.js';
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  extends: ConfigBase,
  props: {},
  data() {
    return {};
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
    addItem(type) {
      this.data[type].push('');
    },
    removeItem(type, index) {
      this.data[type].splice(index, 1);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 20px;
  column-gap: 10px;
}
</style>
