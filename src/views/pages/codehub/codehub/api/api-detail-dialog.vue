<template>
  <TsDialog
    v-bind="setting"
    @on-close="close"
  >
    <template v-slot>
      <div v-if="urlConfig">
        <Collapse v-model="collList">
          <Panel name="brief">
            {{ $t('page.basicinfo') }}
            <div slot="content">
              <div>{{ $t('term.codehub.accessaddress') }}：/api/rest/codehub/{{ url }}</div>
              <div>{{ $t('term.codehub.apidescrition') }}：{{ urlConfig.description||'-' }}</div>
            </div>
          </Panel>
          <Panel name="input">
            {{ $t('page.inputparam') }}
            <div slot="content">
              <TsTable v-if="urlConfig.input && urlConfig.input.length>0" :theadList="inputtheadList" :tbodyList="urlConfig.input">
                <template slot="isRequired" slot-scope="{row}">
                  {{ requiredText[row.isRequired] }}
                </template>

              </TsTable>
              <div v-else>{{ $t('page.notarget', {target: $t('page.inputparam')}) }}</div>
            </div>            
          </Panel>
          <Panel name="output">
            {{ $t('page.outputparam') }}
            <div slot="content">
              <TsTable
                v-if="urlConfig.output && urlConfig.output.length>0"
                :theadList="outputtheadList"
                :tbodyList="urlConfig.output"
                height="600px"
              ></TsTable>
              <div v-else>{{ $t('page.notarget', {target: $t('page.outputparam')}) }}</div>
            </div>              
          </Panel>
        </Collapse>
      </div>
      <div v-else>{{ $t('term.codehub.noapihelpinfo') }}</div>
    </template>
  </TsDialog>
</template>
<script>
import axios from '@/resources/api/http.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  props: {
    url: {
      type: String    
    }
  },
  data() {
    return {
      setting: {
        type: 'slider',
        hasFooter: false,
        maskClose: true,
        isShow: true,
        width: 'medium'
      }, 
      urlConfig: null,
      collList: ['brief', 'input', 'output'],
      inputtheadList: [{
        title: this.$t('page.keyname'),
        key: 'name'
      }, {
        title: this.$t('term.report.datatype.name'),
        key: 'type'
      }, {
        title: this.$t('page.necessary'),
        key: 'isRequired'
      }, {
        title: this.$t('page.description'),
        key: 'description'
      }
      ],
      outputtheadList: [{
        title: this.$t('page.keyname'),
        key: 'name'
      }, {
        title: this.$t('term.report.datatype.name'),
        key: 'type'
      }, {
        title: this.$t('page.description'),
        key: 'description'
      }
      ],
      requiredText: {
        'false': this.$t('page.no'),
        'true': this.$t('page.yes')
      }
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
              name: this.$t('term.codehub.speciallytreated')
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
  computed: {},
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
