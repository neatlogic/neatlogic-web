import { $t } from '@/resources/init.js';

export default {
  'titleType': {
    'globalColor': $t('term.framework.theme.themecolor'),
    'topbg': $t('term.framework.theme.headcolor'),
    'table': $t('term.framework.theme.tablecolor'),
    'formColor': $t('term.framework.theme.formcolor'),
    'menuSelect': $t('term.framework.theme.menucolor'),
    'others': $t('term.framework.theme.otherscolor'),
    'dashboard': $t('term.framework.theme.dashboardcolor'),
    'logo': $t('term.framework.theme.logoimg')
  },
  'light': [
    {
      'titleType': 'globalColor',
      'label': $t('term.framework.theme.themecolor'),
      'param': '--primary-color',
      'value': '#1670F0',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'globalcolor'
    },
    {
      'titleType': 'globalColor',
      'label': $t('term.framework.theme.themehovercolor'),
      'param': '--primary-hover-color',
      'value': '#1670F0',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'globalColor',
      'label': $t('term.framework.theme.themeactivecolor'),
      'param': '--primary-active-color',
      'value': '#004CB8',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'topbg',
      'label': $t('term.framework.theme.headbg'),
      'param': '--topbg-color',
      'value': '#333547',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'menu'
    },
    {
      'titleType': 'topbg',
      'label': $t('term.framework.theme.headbghover'),
      'param': '--top-active',
      'value': '#333547',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'table',
      'label': $t('term.framework.theme.tablestripecolor'),
      'param': '--table-stripe-color',
      'value': '#f7f8fa',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'table'
    },
    {
      'titleType': 'table',
      'label': $t('term.framework.theme.tablehovercoler'),
      'param': '--table-hover-color',
      'value': '#ECEDF0',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'table',
      'label': $t('term.framework.theme.tableseleccolor'),
      'param': '--primary-grey',
      'value': '#E7F0FF',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'table',
      'label': $t('term.framework.theme.thcolor'),
      'param': '--th-bg-color',
      'value': '#EFF0F3',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'formColor',
      'label': $t('term.framework.theme.checkboxcolor'),
      'param': '--condition-checkbox-color',
      'value': '#6ac0ff',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'checkbox-tag'
    },
    {
      'titleType': 'formColor',
      'label': $t('term.framework.theme.selectcolor'),
      'param': '--selected-bg',
      'value': '#E7F3FF',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'select-selected-bg'
    },
    {
      'titleType': 'formColor',
      'label': $t('term.framework.theme.swithbg'),
      'param': '--switch-bg',
      'value': '#96BEF8',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'switch'
    },
    {
      'titleType': 'formColor',
      'label': $t('term.framework.theme.formdisabledcolor'),
      'param': '--form-disabled',
      'value': '#96BEF8',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'form-disabled'
    },
    {
      'titleType': 'menuSelect',
      'label': $t('term.framework.theme.menuselectcolor'),
      'param': '--menu-select',
      'value': '#EFF0F3',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'menuSelect',
      'label': $t('term.framework.theme.menuhovercolor'),
      'param': '--menu-hover',
      'value': '#F6F6F7',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'others',
      'label': $t('term.framework.theme.graycolor'),
      'param': '--gray-color',
      'value': '#F2F4F5',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'others',
      'label': $t('term.report.axis.dividinglinecolor'),
      'param': '--dividing-color',
      'value': '#E5E5E5',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'others',
      'label': $t('page.bordercolor'),
      'param': '--border-color',
      'value': '#E5E5E5',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'others',
      'label': $t('term.framework.theme.warnbg'),
      'param': '--warning-bg-color',
      'value': '#FFF5E7',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'dashboard',
      'label': $t('term.framework.theme.chartcolor'),
      'param': 'chart',
      'value': ['#B9D582', '#68AC90', '#FFBA5A', '#559BFE', '#7B8CFE', '#EC8AD2', '#EEB49F', '#78EAD4', '#E2F293', '#FFA973', '#7BB0F8', '#A1A6FC'],
      'type': 'dashboard',
      'input': 'colorpickerlist'
    },
    {
      'titleType': 'dashboard',
      'label': $t('term.framework.theme.valuebg'),
      'param': 'chart-number',
      'value': ['#C5E2D6', '#E5F1DB', '#D9E8FE', '#DEE2D0', '#FCE5C5', '#F1DBE2'],
      'type': 'dashboard',
      'input': 'colorpickerlist'
    },
    {
      'titleType': 'dashboard',
      'label': $t('term.framework.theme.valuetextcolor'),
      'param': 'chart-number-text',
      'value': ['#76B39A', '#7EA438', '#559BFE', '#9DA788', '#FEBC60', '#EF87A8'],
      'type': 'dashboard',
      'input': 'colorpickerlist'
    },
    {
      'titleType': 'logo',
      'label': $t('term.framework.theme.logosetting'),
      'param': 'logo',
      'value': 'logo_big_dark.png',
      'type': 'file',
      'input': 'file'
    }
  ],
  'dark': [
    {
      'titleType': 'globalColor',
      'title': $t('term.framework.theme.themecolor'),
      'label': $t('term.framework.theme.themecolor'),
      'param': '--primary-color',
      'value': '#00BCD4',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'globalcolor'
    },
    {
      'titleType': 'globalColor',
      'label': $t('term.framework.theme.themehovercolor'),
      'param': '--primary-hover-color',
      'value': '#33C9DC',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'globalColor',
      'label': $t('term.framework.theme.themeactivecolor'),
      'param': '--primary-active-color',
      'value': '#004CB8',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'topbg',
      'label': $t('term.framework.theme.headbg'),
      'param': '--topbg-color',
      'value': '#333547',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'menu'
    },
    {
      'titleType': 'topbg',
      'label': $t('term.framework.theme.headbghover'),
      'param': '--top-active',
      'value': '#3B495F',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'table',
      'label': $t('term.framework.theme.tablestripecolor'),
      'param': '--table-stripe-color',
      'value': '#151824',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'table'
    },
    {
      'titleType': 'table',
      'label': $t('term.framework.theme.tablehovercoler'),
      'param': '--table-hover-color',
      'value': '#2C2F3A',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'table',
      'label': $t('term.framework.theme.tableseleccolor'),
      'value': '#57657D',
      'param': '--primary-grey',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'table',
      'label': $t('term.framework.theme.thcolor'),
      'param': '--th-bg-color',
      'value': '#151824',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'formColor',
      'label': $t('term.framework.theme.checkboxcolor'),
      'param': '--condition-checkbox-color',
      'value': '#6ac0ff',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'checkbox-tag'
    },
    {
      'titleType': 'formColor',
      'label': $t('term.framework.theme.selectcolor'),
      'param': '--selected-bg',
      'value': '#5B5D66',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'select-selected-bg'
    },
    {
      'titleType': 'formColor',
      'name': 'themSwitch',
      'label': $t('term.framework.theme.swithbg'),
      'param': '--switch-bg',
      'value': '#0D4E5D',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'switch'
    },
    {
      'titleType': 'formColor',
      'label': $t('term.framework.theme.formdisabledcolor'),
      'param': '--form-disabled',
      'value': '#96BEF8',
      'type': 'common',
      'input': 'colorpicker',
      'example': 'form-disabled'
    },
    {
      'titleType': 'menuSelect',
      'label': $t('term.framework.theme.menuselectcolor'),
      'param': '--menu-select',
      'value': '#151824',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'menuSelect',
      'label': $t('term.framework.theme.menuhovercolor'),
      'param': '--menu-hover',
      'value': '#2C2F3A',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'others',
      'label': $t('term.framework.theme.graycolor'),
      'param': '--gray-color',
      'value': '#F2F4F5',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'others',
      'label': $t('term.report.axis.dividinglinecolor'),
      'param': '--dividing-color',
      'value': '#464755',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'others',
      'label': $t('page.bordercolor'),
      'param': '--border-color',
      'value': '#464755',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'others',
      'label': $t('term.framework.theme.warnbg'),
      'param': '--warning-bg-color',
      'value': '#7c6e57',
      'type': 'common',
      'input': 'colorpicker'
    },
    {
      'titleType': 'dashboard',
      'label': $t('term.framework.theme.chartcolor'),
      'param': 'chart',
      'value': ['#B9D582', '#68AC90', '#FFBA5A', '#559BFE', '#7B8CFE', '#EC8AD2', '#EEB49F', '#78EAD4', '#E2F293', '#FFA973', '#7BB0F8', '#A1A6FC'],
      'type': 'dashboard',
      'input': 'colorpickerlist'
    },
    {
      'titleType': 'dashboard',
      'label': $t('term.framework.theme.valuebg'),
      'param': 'chart-number',
      'value': ['#C5E2D6', '#E5F1DB', '#D9E8FE', '#DEE2D0', '#FCE5C5', '#F1DBE2'],
      'type': 'dashboard',
      'input': 'colorpickerlist'
    },
    {
      'titleType': 'dashboard',
      'label': $t('term.framework.theme.valuetextcolor'),
      'param': 'chart-number-text',
      'value': ['#76B39A', '#7EA438', '#559BFE', '#9DA788', '#FEBC60', '#EF87A8'],
      'type': 'dashboard',
      'input': 'colorpickerlist'
    },
    {
      'titleType': 'logo',
      'label': $t('term.framework.theme.logosetting'),
      'value': 'logo_big_dark.png',
      'param': 'logo',
      'type': 'file',
      'input': 'file'
    }
  ]
};
