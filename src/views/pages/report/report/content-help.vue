<template>
  <div>
    <Alert show-icon>
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
              内容配置支持
              <b>freemarker</b>
              语法，通过
              <b>report.xxx</b>
              获取指定结果集。
              <br />
              例如：数据源配置中包含id="userList"的select节点和id="teamList"的rest节点，则可通过
              <b>report.userList</b>
              和
              <b>report.teamList</b>
              获取结果集。
              <br />
              <br />
              <p>
                <b>内部函数</b>
              </p>
              系统提供了以下图表函数，帮助快速生成简单图表
              <p>
                表格：
                <b>${drawTable(config[必须，json格式，data字段必须])}</b>
                ，config范例：
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
                柱状图：
                <b>${drawBar(config[必须，json格式，data字段必须])}</b>
                ，data对应数据源范例：
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
                横向柱状图：
                <b>${drawBarH(config[必须，json格式，data字段必须])}</b>
                ，data对应数据源范例：
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
                堆积图：
                <b>${drawStackedBar(config[必须，json格式，data字段必须])}</b>
                ，data对应数据源范例：
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
                横向堆积图：
                <b>${drawStackedBarH(config[必须，json格式，data字段必须])}</b>
                ，data对应数据源范例请参考
                <b>堆积图</b>
              </p>
              <p>
                曲线图：
                <b>${drawLine(config[必须，json格式，data字段必须])}</b>
                ，data对应数据源范例请参考
                <b>柱状图</b>
              </p>
              <p>
                饼图：
                <b>${drawPie(config[必须，json格式，data字段必须])}</b>
                ，data对应数据源范例：
              </p>
              <div>
                <TsCodemirror
                  ref="editor5"
                  :value="pie.data"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
              <p>config范例，适用于以上所有图表：</p>
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
                <b>自定义内容配置</b>
              </p>
              <p>自定义表格规范格式：</p>
              <p>在table标签内需填写tableName属性，表头格式[tableName]>thead>tr>th，数据内容格式[tableName]>tbody>tr>td</p>
              <div>
                <TsCodemirror
                  ref="editor7"
                  :value="custom.table"
                  :isReadOnly="true"
                  codeMode="xml"
                ></TsCodemirror>
              </div>
              <p>自定义表格范例：</p>
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
        config: `{\n   "data":"dataList",\n   "title":"${this.$t('page.title')}",\n   "header":${this.$t('term.report.describe.headerdescribe')},\n   "column":${this.$t('term.report.describe.columndescribe')}\n}`
      },
      barHelp: {
        data: '<resultMap id="bar">\n' + '   <result property="yField"/><!--Y坐标列，必须是数值，必须存在-->\n' + '   <result property="xFiled"/><!--X坐标列，必须存在-->\n' + '   <result property="groupField"/><!--分组列，柱状图选择存在，曲线图必须存在-->\n' + '</resultMap>',
        config: `{\n   "data":"dataList",\n   "title":${this.$t('page.title')},\n   "xLabel":${this.$t('term.report.axis.xcoordinatetitle')},\n   "yLabel":${this.$t('term.report.axis.ycoordinatetitle')},\n   "width":${this.$t('term.report.widthdescribe')},\n   "height":${this.$t('term.report.heightdescribe')},\n   "isShowValue":${this.$t('term.report.showvaluedescribe')},\n   "tick":${this.$t('term.report.tickdescribe')}\n}`
      },
      barhHelp: {
        data: '<resultMap id="barh">\n' + '   <result property="xField"/><!--X坐标列，必须是数值，必须存在-->\n' + '   <result property="yFiled"/><!--Y坐标列，必须存在-->\n' + '   <result property="groupField"/><!--分组列，选择存在-->\n' + '</resultMap>'
      },
      stackedBar: {
        data: '<resultMap id="stacked">\n' + '   <result property="groupField"/><!--一级分类，必须存在-->\n' + '   <collection property="dataList"><!--数据集，必须存在-->\n' + '       <result property="typeField"/><!--二级分类，必须存在-->\n' + '       <result property="valueField"/><!--数组，选择存在-->\n' + '   </collection>\n' + '</resultMap>'
      },
      pie: {
        data: '<resultMap id="pie">\n' + '   <result property="typeField"/><!--分类字段，必须存在-->\n' + '   <result property="valueField"/><!--值字段，必须存在-->\n' + '</resultMap>'
      },
      custom: {
        table: '<table tableName="表格名称">\n' +
               '    <thead>\n' +
               '        <tr>\n' +
               '            <th>字段1</th>\n' +
               '            <th>字段2</th>\n' +
               '        </tr>\n' +
               '    </thead>\n' +
               '    <tbody>\n' +
               '        <tr>\n' +
               '            <td>值1</td>\n' +
               '            <td>值2</td>\n' +
               '        </tr>\n' +
               '    </tbody>\n' +
               '</table>',
        template: '<div class="ivu-card ivu-card-dis-hover ivu-card-shadow">\n' +
                  '    <div class="ivu-card-head">事件处理平均响应时间（分钟）</div>\n' +
                  '    <div class="ivu-card-body tstable-container tstable-normal border tstable-no-fixedHeader block-large">\n' +
                  '        <div class="tstable-main bg-op">\n' +
                  '            <table tablename="事件处理平均响应时间（分钟）" class="table-main tstable-body">\n' +
                  '                <#if (report.userTimeCostData) ?? && ((report.userTimeCostData)?size > 0) >\n' +
                  '                    <thead>\n' +
                  '                        <tr class="th-left">\n' +
                  '                            <th>用户</th>\n' +
                  '                            <th>平均响应时间</th>\n' +
                  '                        </tr>\n' +
                  '                    </thead>\n' +
                  '                    <tbody class="tbody-main">\n' +
                  '                        <#list report.userTimeCostData as item>\n' +
                  '                            <tr>\n' +
                  '                                <td nowrap>${item.用户}</td>\n' +
                  '                                <td nowrap>${item.平均响应时间}</td>\n' +
                  '                            </tr>\n' +
                  '                        </#list>\n' +
                  '                    </tbody>\n' +
                  '                <#else>\n' +
                  '                    <tbody class="tbody-main">\n' +
                  '                        <tr>\n' +
                  '                            <td>无数据</td>\n' +
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
