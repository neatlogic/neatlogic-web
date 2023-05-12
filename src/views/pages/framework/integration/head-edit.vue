<template>
  <div>
    <div v-if="headList && headList.length > 0" class="tstable-container">
      <table class="tstable-body">
        <thead>
          <tr>
            <th style="width:20%">{{ $t('page.key') }}</th>
            <th style="width:40%">{{ $t('page.value') }}</th>
            <th style="width:40%">{{ $t('page.description') }}</th>
            <th>
              <a href="javascript:void(0)" style="margin-right:5px" @click="addHead">
                <i class="tsfont-plus-o"></i>
              </a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in headList" :key="index">
            <td>
              <TsFormInput v-model="item.key" :maxlength="50"></TsFormInput>
            </td>
            <td>
              <TsFormInput v-model="item.value"></TsFormInput>
            </td>
            <td>
              <TsFormInput v-model="item.description" :maxlength="200"></TsFormInput>
            </td>
            <td style="width:50px">
              <a href="javascript:void(0)" style="margin-right:5px" @click="addHead">
                <i class="tsfont-plus-o"></i>
              </a>
              <a href="javascript:void(0)" @click="delHead(item)">
                <i class="tsfont-minus-o"></i>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!headList || headList.length == 0" class="text-action tsfont-plus" @click="addHead">{{ $t('page.config') }}</div>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  components: { TsFormInput },
  props: { integration: { type: Object } },
  data() {
    return { headList: [] };
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
    addHead: function() {
      this.headList.push({ key: '', description: '', value: '' });
    },
    delHead: function(item) {
      this.headList.forEach((element, index) => {
        if (element == item) {
          this.headList.splice(index, 1);
          return false;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    integration: {
      handler: function(val) {
        this.headList = val.config.head || [];
      },
      deep: true,
      immediate: true
    },
    headList: {
      handler: function(val) {
        this.$emit('setHead', val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
