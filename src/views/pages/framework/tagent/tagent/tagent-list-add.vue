<template>
  <div style="margin-left: 50px;">
    <div class="tstable-container">
      <table class="tstable-body">
        <thead>
          <tr>
            <th>IP</th>
            <th>{{ $t('term.framework.mask') }}</th>
            <th>
              <a href="javascript:void(0)" style="margin-right:5px" @click="addHead">
                <i class="tsfont-plus-o"></i>
              </a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in headList"
            :key="index"
            type="tag"
            textName="workName"
          >
            <td>
              <TsFormInput v-model="item.networkIp"></TsFormInput>
            </td>
            <td>
              <TsFormInput v-model="item.mask"></TsFormInput>
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
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: 'TagentListAdd',
  components: { TsFormInput },
  props: {
    value: [Array, Object]
  },
  data() {
    return {
      headList: this.value ? this.value : [
        {
          id: null,
          groupId: null,
          networkIp: '', // 网段IP
          mask: '' // 子网掩码
        }
      ]
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
    addHead: function() {
      // 新增某行数据
      this.headList.push(
        {
          id: null,
          groupId: null,
          networkIp: '',
          mask: ''
        });
    },
    delHead: function(item) {
      // 删除某行数据
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
    headList: {
      handler(val) {
        this.$emit('input', val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
