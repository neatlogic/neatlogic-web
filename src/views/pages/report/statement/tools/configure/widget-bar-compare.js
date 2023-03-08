/*
 * @Descripttion: 柱状对比图 json
 * @version:
 * @Author: qianlishi
 * @Date: 2021-08-29 07:39:35
 * @LastEditors: qianlishi
 * @LastEditTime: 2021-09-28 14:09:58
 */
import Vue from "vue";

export const widgetBarCompare = {
  code: 'widgetBarCompareChart',
  type: 'chart',
  label: Vue.prototype.i18n.t('term.report.columncomparisonchart.name'),
  icon: 'iconduibitupu',
  options: {
    // 配置
    setup: [
      {
        type: 'el-input-text',
        label: Vue.prototype.i18n.t('term.report.layername'),
        name: 'layerName',
        required: false,
        placeholder: '',
        value: Vue.prototype.i18n.t('term.report.columncomparisonchart.name')
      },
      {
        type: 'vue-color',
        label: Vue.prototype.i18n.t('page.backgroundcolor'),
        name: 'background',
        required: false,
        placeholder: '',
        value: ''
      },
      [
        {
          name: Vue.prototype.i18n.t('term.report.columncomparisonchart.columnsetting'),
          list: [
            {
              type: 'el-slider',
              label: Vue.prototype.i18n.t('term.report.columncomparisonchart.maxwidth'),
              name: 'maxWidth',
              required: false,
              placeholder: '',
              value: 15
            },
            {
              type: 'el-slider',
              label: Vue.prototype.i18n.t('term.report.columncomparisonchart.radius'),
              name: 'radius',
              require: false,
              placeholder: '',
              value: 5
            }
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.titlesetting'),
          list: [
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('page.title'),
              name: 'isNoTitle',
              required: false,
              placeholder: '',
              value: true
            },
            {
              type: 'el-input-text',
              label: Vue.prototype.i18n.t('page.title'),
              name: 'titleText',
              required: false,
              placeholder: '',
              value: ''
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('page.fontcolor'),
              name: 'textColor',
              required: false,
              placeholder: '',
              value: '#FFD700'
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.fontweight.name'),
              name: 'textFontWeight',
              required: false,
              placeholder: '',
              selectOptions: [
                {code: 'normal', name: Vue.prototype.i18n.t('term.report.fontweight.normal')},
                {code: 'bold', name: Vue.prototype.i18n.t('term.report.fontweight.bold')},
                {code: 'bolder', name: Vue.prototype.i18n.t('term.report.fontweight.bolder')},
                {code: 'lighter', name: Vue.prototype.i18n.t('term.report.fontweight.lighter')}
              ],
              value: 'normal'
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('page.fontsize'),
              name: 'textFontSize',
              required: false,
              placeholder: '',
              value: 20
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.textalign.name'),
              name: 'textAlign',
              required: false,
              placeholder: '',
              selectOptions: [
                {code: 'center', name: Vue.prototype.i18n.t('term.report.textalign.center')},
                {code: 'left', name: Vue.prototype.i18n.t('term.report.textalign.left')},
                {code: 'right', name: Vue.prototype.i18n.t('term.report.textalign.right')}
              ],
              value: 'center'
            }
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.legendaction'),
          list: [
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.legenddisplay'),
              name: 'isShowLegend',
              required: false,
              placeholder: '',
              value: true
            },
            {
              type: 'el-input-text',
              label: Vue.prototype.i18n.t('term.report.legendname'),
              name: 'legendName',
              required: false,
              placeholder: Vue.prototype.i18n.t('term.report.legendnameplaceholder'),
              value: ''
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('page.fontcolor'),
              name: 'lengedColor',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('page.fontsize'),
              name: 'lengedFontSize',
              required: false,
              placeholder: '',
              value: 12
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.legendwidth'),
              name: 'lengedWidth',
              required: false,
              placeholder: '',
              value: 12
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.horizontalposition'),
              name: 'lateralPosition',
              required: false,
              placeholder: '',
              selectOptions: [
                {code: 'center', name: Vue.prototype.i18n.t('term.report.textalign.center')},
                {code: 'left', name: Vue.prototype.i18n.t('term.report.textalign.left')},
                {code: 'right', name: Vue.prototype.i18n.t('term.report.textalign.right')}
              ],
              value: 'center'
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.verticalposition'),
              name: 'longitudinalPosition',
              required: false,
              placeholder: '',
              selectOptions: [
                {code: 'top', name: Vue.prototype.i18n.t('page.top')},
                {code: 'bottom', name: Vue.prototype.i18n.t('page.bottom')}
              ],
              value: 'top'
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.layoutFront'),
              name: 'layoutFront',
              required: false,
              placeholder: '',
              selectOptions: [
                {code: 'vertical', name: Vue.prototype.i18n.t('term.report.vertical')},
                {code: 'horizontal', name: Vue.prototype.i18n.t('term.report.horizontal')}
              ],
              value: 'horizontal'
            }
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.axis.xleftsetting'),
          list: [
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('page.display'),
              name: 'hideXLeft',
              required: false,
              placeholder: '',
              value: true
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.axis.splitnumber'),
              name: 'splitNumberLeft',
              required: false,
              placeholder: '',
              value: ''
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.valuecolor'),
              name: 'XcolorLeft',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.axis.valuefontsize'),
              name: 'fontSizeXLeft',
              required: false,
              placeholder: '',
              value: 14
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.tickline'),
              name: 'tickLineLeft',
              require: false,
              placeholder: '',
              value: false
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.xaxis'),
              name: 'xLineLeft',
              require: false,
              placeholder: '',
              value: false
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.axiscolor'),
              name: 'lineColorXLeft',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.verticaldividingline'),
              name: 'SplitLineLeft',
              require: false,
              placeholder: '',
              value: false
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.dividinglinecolor'),
              name: 'SplitLineColorLeft',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.axis.dividinglinewidth'),
              name: 'SplitLinefontSizeLeft',
              required: false,
              placeholder: '',
              value: 1
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.borderline'),
              name: 'frameLineLeft',
              require: false,
              placeholder: '',
              value: false
            }
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.axis.xrightsetting'),
          list: [
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('page.display'),
              name: 'hideXRight',
              required: false,
              placeholder: '',
              value: true
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.axis.splitnumber'),
              name: 'splitNumberRight',
              required: false,
              placeholder: '',
              value: ''
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.valuecolor'),
              name: 'XcolorRight',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.axis.valuefontsize'),
              name: 'fontSizeXRight',
              required: false,
              placeholder: '',
              value: 14
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.tickline'),
              name: 'tickLineRight',
              require: false,
              placeholder: '',
              value: false
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.xaxis'),
              name: 'xLineRight',
              require: false,
              placeholder: '',
              value: false
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.axiscolor'),
              name: 'lineColorXRight',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.verticaldividingline'),
              name: 'SplitLineRight',
              require: false,
              placeholder: '',
              value: false
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.dividinglinecolor'),
              name: 'SplitLineColorRight',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.axis.dividinglinewidth'),
              name: 'SplitLinefontSizeRight',
              required: false,
              placeholder: '',
              value: 1
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.borderline'),
              name: 'frameLineRight',
              require: false,
              placeholder: '',
              value: false
            }
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.axis.ysetting'),
          list: [
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('page.display'),
              name: 'hideY',
              required: false,
              placeholder: '',
              value: true
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.valuecolor'),
              name: 'colorY',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.axis.valuefontsize'),
              name: 'fontSizeY',
              required: false,
              placeholder: '',
              value: 14
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.axis.valuealign'),
              name: 'textAlign',
              required: false,
              placeholder: '',
              selectOptions: [
                {code: 'center', name: Vue.prototype.i18n.t('term.report.textalign.center')},
                {code: 'left', name: Vue.prototype.i18n.t('term.report.textalign.left')},
                {code: 'right', name: Vue.prototype.i18n.t('term.report.textalign.right')}
              ],
              value: 'center'
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.tickline'),
              name: 'tickLineY',
              require: false,
              placeholder: '',
              value: false
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.yaxis'),
              name: 'lineY',
              require: false,
              placeholder: '',
              value: false
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.axiscolor'),
              name: 'lineColorY',
              required: false,
              placeholder: '',
              value: '#fff'
            }
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.valuesetting'),
          list: [
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('page.display'),
              name: 'isShow',
              required: false,
              placeholder: '',
              value: true
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('page.fontsize'),
              name: 'fontSize',
              required: false,
              placeholder: '',
              value: 14
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('page.fontcolor'),
              name: 'subTextColor',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.fontweight.name'),
              name: 'fontWeight',
              required: false,
              placeholder: '',
              selectOptions: [
                {code: 'normal', name: Vue.prototype.i18n.t('term.report.fontweight.normal')},
                {code: 'bold', name: Vue.prototype.i18n.t('term.report.fontweight.bold')},
                {code: 'bolder', name: Vue.prototype.i18n.t('term.report.fontweight.bolder')},
                {code: 'lighter', name: Vue.prototype.i18n.t('term.report.fontweight.lighter')}
              ],
              value: 'normal'
            }
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.tipsetting'),
          list: [
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('page.fontsize'),
              name: 'tipsFontSize',
              required: false,
              placeholder: '',
              value: 16
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('page.fontcolor'),
              name: 'lineColor',
              required: false,
              placeholder: ''
            }
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.axis.axismarginsetting'),
          list: [
            {
              type: 'el-slider',
              label: Vue.prototype.i18n.t('term.report.axis.marginleftright'),
              name: 'marginLeftRight',
              required: false,
              placeholder: '',
              value: 10
            },
            {
              type: 'el-slider',
              label: Vue.prototype.i18n.t('term.report.axis.margintop'),
              name: 'marginTop',
              required: false,
              placeholder: '',
              value: 40
            },
            {
              type: 'el-slider',
              label: Vue.prototype.i18n.t('term.report.axis.marginbottom'),
              name: 'marginBottom',
              required: false,
              placeholder: '',
              value: 10
            }
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.customcolor'),
          list: [
            {
              type: 'customColor',
              label: '',
              name: 'customColor',
              required: false,
              value: [{color: '#36c5e7'}, {color: '#e68b55'}]
            }
          ]
        }
      ]
    ],
    // 数据
    data: [
      {
        type: 'el-radio-group',
        label: Vue.prototype.i18n.t('term.report.datatype.name'),
        name: 'dataType',
        require: false,
        placeholder: '',
        selectValue: true,
        selectOptions: [
          {
            code: 'staticData',
            name: Vue.prototype.i18n.t('term.report.datatype.staticdata')
          },
          {
            code: 'dynamicData',
            name: Vue.prototype.i18n.t('term.report.datatype.dynamicdata')
          }
        ],
        value: 'staticData'
      },
      {
        type: 'el-input-number',
        label: Vue.prototype.i18n.t('term.report.datatype.refreshTime'),
        name: 'refreshTime',
        relactiveDom: 'dataType',
        relactiveDomValue: 'dynamicData',
        value: 5000
      },
      {
        type: 'el-button',
        label: Vue.prototype.i18n.t('term.report.datatype.staticdata'),
        name: 'staticData',
        required: false,
        placeholder: '',
        relactiveDom: 'dataType',
        relactiveDomValue: 'staticData',
        value: [
          {'axis': '07-25', 'name': 'success', 'data': '2'},
          {'axis': '07-25', 'name': 'fail', 'data': '10'},
          {'axis': '07-26', 'name': 'success', 'data': '5'},
          {'axis': '07-26', 'name': 'fail', 'data': '20'},
          {'axis': '07-27', 'name': 'success', 'data': '15'},
          {'axis': '07-27', 'name': 'fail', 'data': '30'},
          {'axis': '07-28', 'name': 'success', 'data': '10'},
          {'axis': '07-28', 'name': 'fail', 'data': '12'},
          {'axis': '07-29', 'name': 'success', 'data': '9'},
          {'axis': '07-29', 'name': 'fail', 'data': '16'}
        ]
      },
      {
        type: 'dycustComponents',
        label: '',
        name: 'dynamicData',
        required: false,
        placeholder: '',
        relactiveDom: 'dataType',
        relactiveDomValue: 'dynamicData',
        chartType: 'widget-stackchart',
        dictKey: 'STACK_PROPERTIES',
        value: ''
      }
    ],
    // 坐标
    position: [
      {
        type: 'el-input-number',
        label: Vue.prototype.i18n.t('term.report.position.left'),
        name: 'left',
        required: false,
        placeholder: '',
        value: 0
      },
      {
        type: 'el-input-number',
        label: Vue.prototype.i18n.t('term.report.position.top'),
        name: 'top',
        required: false,
        placeholder: '',
        value: 0
      },
      {
        type: 'el-input-number',
        label: Vue.prototype.i18n.t('page.width'),
        name: 'width',
        required: false,
        placeholder: Vue.prototype.i18n.t('term.report.position.widthplaceholder'),
        value: 500
      },
      {
        type: 'el-input-number',
        label: Vue.prototype.i18n.t('page.width'),
        name: 'height',
        required: false,
        placeholder: Vue.prototype.i18n.t('term.report.position.heightplaceholder'),
        value: 250
      }
    ]
  }
};
