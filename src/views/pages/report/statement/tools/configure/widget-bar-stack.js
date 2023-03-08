/*
 * @Descripttion: 柱状堆叠图
 * @version:
 * @Author: qianlishi
 * @Date: 2021-08-29 07:37:09
 * @LastEditors: qianlishi
 * @LastEditTime: 2021-09-28 14:11:09
 */
import Vue from "vue";

export const widgetBarStack = {
  code: 'widgetBarStackChart',
  type: 'chart',
  label: Vue.prototype.i18n.t('term.report.axiscolumnstackchart.name'),
  icon: 'iconbianzu23',
  options: {
    // 配置
    setup: [
      {
        type: 'el-input-text',
        label: Vue.prototype.i18n.t('term.report.layername'),
        name: 'layerName',
        required: false,
        placeholder: '',
        value: Vue.prototype.i18n.t('term.report.axiscolumnstackchart.name')
      },
      {
        type: 'el-switch',
        label: Vue.prototype.i18n.t('term.report.axiscolumnstackchart.verticalshow'),
        name: 'verticalShow',
        required: false,
        placeholder: '',
        value: false
      },
      {
        type: 'vue-color',
        label: Vue.prototype.i18n.t('page.backgroundcolor'),
        name: 'background',
        required: false,
        placeholder: '',
        value: ''
      },
      {
        type: 'el-select',
        label: Vue.prototype.i18n.t('term.report.axiscolumnstackchart.stackstyle'),
        name: 'stackStyle',
        required: false,
        placeholder: '',
        selectOptions: [
          {code: 'leftRight', name: Vue.prototype.i18n.t('term.report.axiscolumnstackchart.stackleftright')},
          {code: 'upDown', name: Vue.prototype.i18n.t('term.report.axiscolumnstackchart.stacktopbottom')}
        ],
        value: 'leftRight'
      },
      [
        {
          name: Vue.prototype.i18n.t('term.report.axiscolumnstackchart.columnsetting'),
          list: [
            {
              type: 'el-slider',
              label: Vue.prototype.i18n.t('term.report.axiscolumnstackchart.maxwidth'),
              name: 'maxWidth',
              required: false,
              placeholder: '',
              value: 20
            },
            {
              type: 'el-slider',
              label: Vue.prototype.i18n.t('term.report.axiscolumnstackchart.radius'),
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
            },
            {
              type: 'el-input-text',
              label: Vue.prototype.i18n.t('page.subtitle'),
              name: 'subText',
              required: false,
              placeholder: '',
              value: ''
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('page.fontcolor'),
              name: 'subTextColor',
              required: false,
              placeholder: '',
              value: 'rgba(30, 144, 255, 1)'
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.fontweight.name'),
              name: 'subTextFontWeight',
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
              name: 'subTextFontSize',
              required: false,
              placeholder: '',
              value: 20
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
          name: Vue.prototype.i18n.t('term.report.axis.xsetting'),
          list: [
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('page.display'),
              name: 'hideX',
              required: false,
              placeholder: '',
              value: true
            },
            {
              type: 'el-input-text',
              label: Vue.prototype.i18n.t('term.report.axis.xaxisalias'),
              name: 'xName',
              required: false,
              placeholder: '',
              value: ''
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.aliascolor'),
              name: 'xNameColor',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.axis.aliassize'),
              name: 'xNameFontSize',
              required: false,
              placeholder: '',
              value: 14
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.axisreverse'),
              name: 'reversalX',
              required: false,
              placeholder: '',
              value: false
            },
            {
              type: 'el-slider',
              label: Vue.prototype.i18n.t('term.report.axis.textAngleX'),
              name: 'textAngleX',
              required: false,
              placeholder: '',
              value: 0
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.axis.textspacing'),
              name: 'textInterval',
              required: false,
              placeholder: '',
              value: ''
            },
            {
              type: 'vue-color',
              label:  Vue.prototype.i18n.t('page.fontcolor'),
              name: 'Xcolor',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-input-number',
              label:  Vue.prototype.i18n.t('page.fontsize'),
              name: 'fontSizeX',
              required: false,
              placeholder: '',
              value: 14
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.axiscolor'),
              name: 'lineColorX',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.dividinglinedisplay'),
              name: 'isShowSplitLineX',
              require: false,
              placeholder: '',
              value: false
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.dividinglinecolor'),
              name: 'splitLineColorX',
              required: false,
              placeholder: '',
              value: '#fff'

            }
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.axis.ysetting'),
          list: [
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('page.display'),
              name: 'isShowY',
              require: false,
              placeholder: '',
              value: true
            },
            {
              type: 'el-input-text',
              label: Vue.prototype.i18n.t('term.report.axis.yaxisalias'),
              name: 'textNameY',
              require: false,
              placeholder: '',
              value: ''
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.aliascolor'),
              name: 'NameColorY',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.axis.aliassize'),
              name: 'NameFontSizeY',
              required: false,
              placeholder: '',
              value: 14
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.axisreverse'),
              name: 'reversalY',
              required: false,
              placeholder: '',
              value: false
            },
            {
              type: 'el-slider',
              label: Vue.prototype.i18n.t('term.report.axis.textAngleX'),
              name: 'textAngleY',
              required: false,
              placeholder: '',
              value: 0
            },
            {
              type: 'vue-color',
            label:  Vue.prototype.i18n.t('page.fontcolor'),
              name: 'colorY',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-input-number',
              label:  Vue.prototype.i18n.t('page.fontsize'),
              name: 'fontSizeY',
              required: false,
              placeholder: '',
              value: 14
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.axiscolor'),
              name: 'lineColorY',
              required: false,
              placeholder: '',
              value: '#fff'
            },
            {
              type: 'el-switch',
              label: Vue.prototype.i18n.t('term.report.axis.dividinglinedisplay'),
              name: 'isShowSplitLineY',
              require: false,
              placeholder: '',
              value: false
            }, {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.axis.dividinglinecolor'),
              name: 'splitLineColorY',
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
              value: false
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
              label: Vue.prototype.i18n.t('term.report.axis.marginleft'),
              name: 'marginLeft',
              required: false,
              placeholder: '',
              value: 10
            }, {
              type: 'el-slider',
              label: Vue.prototype.i18n.t('term.report.axis.margintop'),
              name: 'marginTop',
              required: false,
              placeholder: '',
              value: 50
            }, {
              type: 'el-slider',
              label: Vue.prototype.i18n.t('term.report.axis.marginright'),
              name: 'marginRight',
              required: false,
              placeholder: '',
              value: 40
            }, {
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
              value: [{color: '#ff7f50'}, {color: '#87cefa'}, {color: '#da70d6'}, {color: '#32cd32'}, {color: '#6495ed'}]
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
          {'axis': '2021-07-25', 'name': 'A', 'data': '12'},
          {'axis': '2021-07-25', 'name': 'B', 'data': '20'},
          {'axis': '2021-07-26', 'name': 'B', 'data': '5'},
          {'axis': '2021-07-27', 'name': 'A', 'data': '15'},
          {'axis': '2021-07-27', 'name': 'B', 'data': '30'}
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
