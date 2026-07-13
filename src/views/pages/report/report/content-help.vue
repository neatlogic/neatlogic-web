<template>
  <div>
    <Alert>
      <div>
        <Poptip
          v-model="isHelpShow"
          trigger="hover"
          placement="right"
          width="800"
          :transfer="true"
          :title="$t('term.report.contentconfigexample')"
        >
          <a href="javascript:void(0)">{{ $t('term.report.contentconfigexample') }}</a>
          <div slot="content" style="height:600px;">
            <div>
              {{ $t('term.report.contenthelpsupport') }}
              <b>freemarker</b>
              {{ $t('term.report.syntaxvia') }}
              <b>report.xxx</b>
              {{ $t('term.report.getspecifiedresultset') }}
              <br />
              {{ $t('term.report.contenthelpexampleprefix') }}
              <b>report.userList</b>
              {{ $t('term.report.and') }}
              <b>report.teamList</b>
              {{ $t('term.report.getresultset') }}
              <br />
              <br />
              <p>
                <b>{{ $t('term.report.internalfunction') }}</b>
              </p>
              {{ $t('term.report.chartfunctiondesc') }}
              <p>
                {{ $t('term.report.table') }}:
                <b>${drawTable(config[{{ $t('term.report.requiredjsondataconfig') }}])}</b>
                {{ $t('term.report.configexampleprefix') }}
              </p>
              <div>
                <TsCodemirror
                  ref="editor1"
                  :value="table.config"
                  :isReadOnly="true"
                  codeMode="json"
                ></TsCodemirror>
              </div>
              <p>
                {{ $t('term.report.chartsetting.barchart') }}:
                <b>${drawBar(config[{{ $t('term.report.requiredjsondataconfig') }}])}</b>
                {{ $t('term.report.datasourcemappingexample') }}
              </p>
              <div>
                <TsCodemirror
                  ref="editor2"
                  :value="barHelp.data"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
              <p>
                {{ $t('term.report.chartsetting.horizontalbarchart') }}:
                <b>${drawBarH(config[{{ $t('term.report.requiredjsondataconfig') }}])}</b>
                {{ $t('term.report.datasourcemappingexample') }}
              </p>
              <div>
                <TsCodemirror
                  ref="editor3"
                  :value="barhHelp.data"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
              <p>
                {{ $t('term.report.stackedchart') }}:
                <b>${drawStackedBar(config[{{ $t('term.report.requiredjsondataconfig') }}])}</b>
                {{ $t('term.report.datasourcemappingexample') }}
              </p>
              <div>
                <TsCodemirror
                  ref="editor4"
                  :value="stackedBar.data"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
              <p>
                {{ $t('term.report.horizontalstackedchart') }}:
                <b>${drawStackedBarH(config[{{ $t('term.report.requiredjsondataconfig') }}])}</b>
                {{ $t('term.report.datasourcemappingrefer') }}
                <b>{{ $t('term.report.stackedchart') }}</b>
              </p>
              <p>
                {{ $t('term.report.curvechart') }}:
                <b>${drawLine(config[{{ $t('term.report.requiredjsondataconfig') }}])}</b>
                {{ $t('term.report.datasourcemappingrefer') }}
                <b>{{ $t('term.report.chartsetting.barchart') }}</b>
              </p>
              <p>
                {{ $t('term.report.chartsetting.piechart') }}:
                <b>${drawPie(config[{{ $t('term.report.requiredjsondataconfig') }}])}</b>
                {{ $t('term.report.datasourcemappingexample') }}
              </p>
              <div>
                <TsCodemirror
                  ref="editor5"
                  :value="pie.data"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
              <p>{{ $t('term.report.configexampleforallcharts') }}</p>
              <div>
                <TsCodemirror
                  ref="editor6"
                  :value="barHelp.config"
                  :isReadOnly="true"
                  codeMode="json"
                ></TsCodemirror>
              </div>
              <br />
              <p>
                <b>{{ $t('term.report.customcontentconfig') }}</b>
              </p>
              <p>{{ $t('term.report.customtableformat') }}</p>
              <p>{{ $t('term.report.customtableformatdesc') }}</p>
              <div>
                <TsCodemirror
                  ref="editor7"
                  :value="custom.table"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
              <p>{{ $t('term.report.customtableexample') }}</p>
              <div>
                <TsCodemirror
                  ref="editor8"
                  :value="custom.template"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
            </div>
          </div>
        </Poptip>
      </div>
    </Alert>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
  },
  filters: {},
  props: {},
  data() {
    return {
      isHelpShow: false,
      table: {
        config: `{\n   "data":"dataList",\n   "title":"${this.$t('page.title')}",\n   "header":${this.$t('term.report.describe.headerdescribe')},\n   "column":${this.$t('term.report.describe.columndescribe')},\n   "disableXss":0,\n   "pageSize":20,\n   "needPage":true\n}`
      },
      barHelp: {
        data: '<resultMap id="bar">\n' + '   <result property="yField"/><!--' + this.$t('term.report.yfieldrequirednumber') + '-->\n' + '   <result property="xFiled"/><!--' + this.$t('term.report.xfieldrequired') + '-->\n' + '   <result property="groupField"/><!--' + this.$t('term.report.groupfieldbaroptional') + '-->\n' + '</resultMap>',
        config: `{\n   "data":"dataList",\n   "title":${this.$t('page.title')},\n   "xLabel":${this.$t('term.report.axis.xcoordinatetitle')},\n   "yLabel":${this.$t('term.report.axis.ycoordinatetitle')},\n   "width":${this.$t('term.report.widthdescribe')},\n   "height":${this.$t('term.report.heightdescribe')},\n   "isShowValue":${this.$t('term.report.showvaluedescribe')},\n   "tick":${this.$t('term.report.tickdescribe')}\n}`
      },
      barhHelp: {
        data: '<resultMap id="barh">\n' + '   <result property="xField"/><!--' + this.$t('term.report.xfieldrequirednumber') + '-->\n' + '   <result property="yFiled"/><!--' + this.$t('term.report.yfieldrequired') + '-->\n' + '   <result property="groupField"/><!--' + this.$t('term.report.groupfieldoptional') + '-->\n' + '</resultMap>'
      },
      stackedBar: {
        data: '<resultMap id="stacked">\n' + '   <result property="groupField"/><!--' + this.$t('term.report.primarycategoryrequired') + '-->\n' + '   <collection property="dataList"><!--' + this.$t('term.report.datasetrequired') + '-->\n' + '       <result property="typeField"/><!--' + this.$t('term.report.secondarycategoryrequired') + '-->\n' + '       <result property="valueField"/><!--' + this.$t('term.report.arrayoptional') + '-->\n' + '   </collection>\n' + '</resultMap>'
      },
      pie: {
        data: '<resultMap id="pie">\n' + '   <result property="typeField"/><!--' + this.$t('term.report.categoryfieldrequired') + '-->\n' + '   <result property="valueField"/><!--' + this.$t('term.report.valuefieldrequired') + '-->\n' + '</resultMap>'
      },
      custom: {
        table: '<table tableName="' + this.$t('term.report.tablename') + '">\n' +
               '    <thead>\n' +
               '        <tr>\n' +
               '            <th>' + this.$t('term.report.field1') + '</th>\n' +
               '            <th>' + this.$t('term.report.field2') + '</th>\n' +
               '        </tr>\n' +
               '    </thead>\n' +
               '    <tbody>\n' +
               '        <tr>\n' +
               '            <td>' + this.$t('term.report.value1') + '</td>\n' +
               '            <td>' + this.$t('term.report.value2') + '</td>\n' +
               '        </tr>\n' +
               '    </tbody>\n' +
               '</table>',
        template: '<div class="ivu-card ivu-card-dis-hover ivu-card-shadow">\n' +
                  '    <div class="ivu-card-head">' + this.$t('term.report.eventavgresponsetime') + '</div>\n' +
                  '    <div class="ivu-card-body tstable-container tstable-normal border tstable-no-fixedHeader block-large">\n' +
                  '        <div class="tstable-main bg-op">\n' +
                  '            <table tablename="' + this.$t('term.report.eventavgresponsetime') + '" class="table-main tstable-body">\n' +
                  '                <#if (report.userTimeCostData) ?? && ((report.userTimeCostData)?size > 0) >\n' +
                  '                    <thead>\n' +
                  '                        <tr class="th-left">\n' +
                  '                            <th>' + this.$t('page.user') + '</th>\n' +
                  '                            <th>' + this.$t('term.report.avgresponsetime') + '</th>\n' +
                  '                        </tr>\n' +
                  '                    </thead>\n' +
                  '                    <tbody class="tbody-main">\n' +
                  '                        <#list report.userTimeCostData as item>\n' +
                  '                            <tr>\n' +
                  '                                <td nowrap>${item["' + this.$t('page.user') + '"]}</td>\n' +
                  '                                <td nowrap>${item["' + this.$t('term.report.avgresponsetime') + '"]}</td>\n' +
                  '                            </tr>\n' +
                  '                        </#list>\n' +
                  '                    </tbody>\n' +
                  '                <#else>\n' +
                  '                    <tbody class="tbody-main">\n' +
                  '                        <tr>\n' +
                  '                            <td>' + this.$t('page.nodata') + '</td>\n' +
                  '                        </tr>\n' +
                  '                    </tbody>\n' +
                  '                </#if>\n' +
                  '            </table>\n' +
                  '        </div>\n' +
                  '    </div>\n' +
                  '</div>'
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
  methods: {},
  computed: {},
  watch: {
    isHelpShow: {
      handler: function(val) {
        if (val) {
          this.$nextTick(() => {
            for (let e in this.$refs) {
              if (this.$refs[e] && this.$refs[e].refresh) {
                this.$refs[e].refresh();
              }
            }
          });
        }
      }
    }
  }
};
</script>
<style lang="less" scoped></style>
