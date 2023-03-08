/*
 * @Descripttion: 主文件
 * @version: 
 * @Author: qianlishi
 * @Date: 2021-08-29 06:43:07
 * @LastEditors: qianlishi
 * @LastEditTime: 2021-12-13 10:22:37
 */
import { widgetTool } from './main';
import Vue from "vue";

const screenConfig = {
  code: 'screen',
  type: 'screen',
  label: Vue.prototype.i18n.t('term.report.screensetting'),
  icon: '',
  options: {
    setup: [
      {
        type: 'el-input-number',
        label: Vue.prototype.i18n.t('term.report.screenwidth'),
        name: 'width',
        required: false,
        placeholder: 'px',
        value: '1920'
      },
      {
        type: 'el-input-number',
        label: Vue.prototype.i18n.t('term.report.screenheight'),
        name: 'height',
        required: false,
        placeholder: 'px',
        value: '1080'
      },
      {
        type: 'el-input-text',
        label: Vue.prototype.i18n.t('page.title'),
        name: 'title',
        require: false,
        placeholder: '',
        value: '大屏'
      },
      {
        type: 'el-input-textarea',
        label: Vue.prototype.i18n.t('term.report.screendescription'),
        name: 'description',
        required: false,
        placeholder: ''
      },
      {
        type: 'vue-color',
        label: Vue.prototype.i18n.t('page.backgroundcolor'),
        name: 'backgroundColor',
        required: false,
        placeholder: '',
        value: '#000'
      },
      {
        type: 'custom-upload',
        label: Vue.prototype.i18n.t('term.report.backgroundimage'),
        name: 'backgroundImage',
        required: false,
        placeholder: '',
        value: 'https://report.anji-plus.com/file/download/bf566e48-ccad-40e1-8ee9-228427e5466b'
      }
    ],
    data: [],
    position: []
  }
};
const widgetTools = [
  ...widgetTool
];

const getToolByCode = function(code) {
  // 获取大屏底层设置属性
  if (code == 'screen') {
    return screenConfig;
  }
  // 获取组件
  let item = widgetTools.find(function(item, index, arrs) {
    return item.code === code;
  });
  return item;
};

export {widgetTools, getToolByCode};
