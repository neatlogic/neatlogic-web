/*
 * @Descripttion: 气泡地图json
 * @version: 
 * @Author: qianlishi
 * @Date: 2021-08-29 07:35:32
 * @LastEditors: qianlishi
 * @LastEditTime: 2021-09-28 14:10:01
 */
import Vue from "vue";

export const widgetAirbubbleMap = {
  code: 'widgetAirBubbleMap',
  type: 'chart',
  label: Vue.prototype.i18n.t('term.report.bubblemap'),
  icon: 'iconzhongguoditu',
  options: {
    // 配置
    setup: [
      {
        type: 'el-input-text',
        label: Vue.prototype.i18n.t('term.report.layername'),
        name: 'layerName',
        required: false,
        placeholder: '',
        value: Vue.prototype.i18n.t('term.report.bubblemap')
      },
      {
        type: 'vue-color',
        label: Vue.prototype.i18n.t('page.backgroundcolor'),
        name: 'background',
        required: false,
        placeholder: '',
        value: '#0F1C3C'
      },
      [
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
              value: '#fff'
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.fontweight.name'),
              name: 'fontweight',
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
              label:  Vue.prototype.i18n.t('page.fontsize'),
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
              value: 'left'
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
              value: ''
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.fontweight.name'),
              name: 'subfontweight',
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
              value: 12
            }
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.fontsetting.name'),
          list: [
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.fontsetting.textsize'),
              name: 'fontTextSize',
              required: false,
              placeholder: '',
              value: 15
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.fontsetting.color'),
              name: 'fontTextColor',
              required: false,
              placeholder: '',
              value: '#D4EEFF'
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.fontsetting.textweight'),
              name: 'fontTextWeight',
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
              label: Vue.prototype.i18n.t('term.report.fontsetting.fontdatasize'),
              name: 'fontDataSize',
              required: false,
              placeholder: '',
              value: 15
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.fontsetting.fontdatasize'),
              name: 'fontDataColor',
              required: false,
              placeholder: '',
              value: '#D4EEFF'
            },
            {
              type: 'el-select',
              label: Vue.prototype.i18n.t('term.report.fontsetting.fontdataweight'),
              name: 'fontDataWeight',
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
          name: Vue.prototype.i18n.t('term.report.bubblesetting.name'),
          list: [
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.bubblesetting.fontminsize4pin'),
              name: 'fontminSize4Pin',
              required: false,
              placeholder: '',
              value: 20
            },
            {
              type: 'el-input-number',
              label: Vue.prototype.i18n.t('term.report.bubblesetting.fontmaxsize4pin'),
              name: 'fontmaxSize4Pin',
              required: false,
              placeholder: '',
              value: 100
            }
            /*{
                type: 'vue-color',
                label: '气泡颜色',
                name: 'fontPieColor',
                required: false,
                placeholder: '',
                value: ''
              },*/
          ]
        },
        {
          name: Vue.prototype.i18n.t('term.report.mapcolor.name'),
          list: [
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.mapcolor.font0precolor'),
              name: 'font0PreColor',
              required: false,
              placeholder: '',
              value: '#073684'
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.mapcolor.font100precolor'),
              name: 'font100PreColor',
              required: false,
              placeholder: '',
              value: '#061E3D'
            },
            {
              type: 'vue-color',
              label: Vue.prototype.i18n.t('term.report.mapcolor.fonthighlightcolor'),
              name: 'fontHighlightColor',
              required: false,
              placeholder: '',
              value: '#2B91B7'
            }
          ]
        }
      ]
    ],
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
          {'name': Vue.prototype.i18n.t('term.report.datatype.nanhaiislands'), 'value': 1},
          {'name': Vue.prototype.i18n.t('term.report.datatype.beijing'), 'value': 524},
          {'name': Vue.prototype.i18n.t('term.report.datatype.tianjin'), 'value': 14},
          {'name': Vue.prototype.i18n.t('term.report.datatype.shanghai'), 'value': 150},
          {'name': Vue.prototype.i18n.t('term.report.datatype.chongqing'), 'value': 75},
          {'name': Vue.prototype.i18n.t('term.report.datatype.hebei'), 'value': 13},
          {'name': Vue.prototype.i18n.t('term.report.datatype.henan'), 'value': 83},
          {'name': Vue.prototype.i18n.t('term.report.datatype.yunnan'), 'value': 11},
          {'name': Vue.prototype.i18n.t('term.report.datatype.liaoning'), 'value': 19},
          {'name': Vue.prototype.i18n.t('term.report.datatype.heilongjiang'), 'value': 15},
          {'name': Vue.prototype.i18n.t('term.report.datatype.hunan'), 'value': 69},
          {'name': Vue.prototype.i18n.t('term.report.datatype.anhui'), 'value': 260},
          {'name': Vue.prototype.i18n.t('term.report.datatype.shandong'), 'value': 39},
          {'name': Vue.prototype.i18n.t('term.report.datatype.xinjiang'), 'value': 4},
          {'name': Vue.prototype.i18n.t('term.report.datatype.jiangsu'), 'value': 31},
          {'name': Vue.prototype.i18n.t('term.report.datatype.zhejiang'), 'value': 104},
          {'name': Vue.prototype.i18n.t('term.report.datatype.jiangxi'), 'value': 36},
          {'name': Vue.prototype.i18n.t('term.report.datatype.hubei'), 'value': 1052},
          {'name': Vue.prototype.i18n.t('term.report.datatype.guangxi'), 'value': 33},
          {'name': Vue.prototype.i18n.t('term.report.datatype.gansu'), 'value': 347},
          {'name': Vue.prototype.i18n.t('term.report.datatype.shanxi'), 'value': 8},
          {'name': Vue.prototype.i18n.t('term.report.datatype.neimenggu'), 'value': 157},
          {'name': Vue.prototype.i18n.t('term.report.datatype.shaanxi'), 'value': 22},
          {'name': Vue.prototype.i18n.t('term.report.datatype.jilin'), 'value': 4},
          {'name': Vue.prototype.i18n.t('term.report.datatype.fujian'), 'value': 36},
          {'name': Vue.prototype.i18n.t('term.report.datatype.guizhou'), 'value': 39},
          {'name': Vue.prototype.i18n.t('term.report.datatype.guangdong'), 'value': 996},
          {'name': Vue.prototype.i18n.t('term.report.datatype.qinghai'), 'value': 27},
          {'name': Vue.prototype.i18n.t('term.report.datatype.tibet'), 'value': 31},
          {'name': Vue.prototype.i18n.t('term.report.datatype.sichuan'), 'value': 46},
          {'name': Vue.prototype.i18n.t('term.report.datatype.ningxia'), 'value': 16},
          {'name': Vue.prototype.i18n.t('term.report.datatype.hainan'), 'value': 22},
          {'name': Vue.prototype.i18n.t('term.report.datatype.taiwan'), 'value': 6},
          {'name': Vue.prototype.i18n.t('term.report.datatype.hongkong'), 'value': 2},
          {'name': Vue.prototype.i18n.t('term.report.datatype.macao'), 'value': 9}]
      },
      {
        type: 'dycustComponents',
        label: '',
        name: 'dynamicData',
        required: false,
        placeholder: '',
        relactiveDom: 'dataType',
        chartType: 'widget-piechart',
        dictKey: 'MAP_PROPERTIES',
        relactiveDomValue: 'dynamicData',
        value: ''
      }
    ],
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
        value: 600
      },
      {
        type: 'el-input-number',
        label: Vue.prototype.i18n.t('page.height'),
        name: 'height',
        required: false,
        placeholder: Vue.prototype.i18n.t('term.report.position.heightplaceholder'),
        value: 400
      }
    ]
  }
};
