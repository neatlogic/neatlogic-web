<template>
  <TsDialog
    v-if="isShow"
    v-bind="setting"
    :isShow="isShow"
    @on-close="close"
  >
    <template v-slot>
      <div v-if="urlConfig">
        <Collapse v-model="collList">
          <Panel name="brief">
            基本信息
            <div slot="content">
              <div>访问地址：/module/codehub/api/rest/{{ url }}</div>
              <div>接口描述：{{ urlConfig.description||'-' }}</div>
            </div>
          </Panel>
          <Panel name="input">
            输入参数
            <div slot="content">
              <TsTable v-if="urlConfig.input && urlConfig.input.length>0" :theadList="inputtheadList" :tbodyList="urlConfig.input">
                <template slot="isRequired" slot-scope="{row}">
                  {{ requiredText[row.isRequired] }}
                </template>

              </TsTable>
              <div v-else>暂无输入参数</div>
            </div>            
          </Panel>
          <Panel name="output">
            输出参数
            <div slot="content">
              <TsTable
                v-if="urlConfig.output && urlConfig.output.length>0"
                :theadList="outputtheadList"
                :tbodyList="urlConfig.output"
                height="600px"
              ></TsTable>
              <div v-else>暂无输出参数</div>
            </div>              
          </Panel>
        </Collapse>
      </div>
      <div v-else>暂无接口帮助信息</div>
    </template>
  </TsDialog>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
import axios from '@/resources/api/http.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    url: {
      type: String    
    }
  },
  data() {
    let _this = this;
    return {
      setting: {
        type: 'slider',
        hasFooter: false,
        maskClose: true,
        width: 'medium'
      }, 
      urlConfig: null,
      collList: ['brief', 'input', 'output'],
      inputtheadList: [{
        title: 'key名',
        key: 'name'
      }, {
        title: '数据类型',
        key: 'type'
      }, {
        title: '必需',
        key: 'isRequired'
      }, {
        title: '说明',
        key: 'description'
      }
      ],
      outputtheadList: [{
        title: 'key名',
        key: 'name'
      }, {
        title: '数据类型',
        key: 'type'
      }, {
        title: '说明',
        key: 'description'
      }
      ],
      requiredText: {
        'false': '否',
        'true': '是'
      }
    
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {

  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    getSetting(url) {
      let fullurl = '/module/codehub/api/help/' + (url.indexOf('binary') == 0 ? url : 'rest/' + url);
      axios.get(fullurl).then(res => {
        let result = res;
        if (url.indexOf('/get') > 0) {
          if (result.output[0] && result.output[0].content) {
            Object.assign(result.output[0], {
              children: result.output[0].content,
              name: '特殊处理的'
            }); 
          }
        }
        this.urlConfig = result;
      }).catch(err => {
        this.urlConfig = null;
      });
    }
  },
  filter: {},
  computed: {
  },
  watch: {
    url: {
      handler: function(val) {
        if (val) {
          this.getSetting(val);
        } else {
          this.urlConfig = null;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>

</style>
