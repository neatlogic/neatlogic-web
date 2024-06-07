import formlabel from './formlabel.vue';
import formtext from './formtext.vue';
import formtextarea from './formtextarea.vue';
import formckeditor from './formckeditor.vue';
import formnumber from './formnumber.vue';
import formpassword from './formpassword.vue';
import formselect from './formselect.vue';
import formcascader from './formcascader.vue';
import formradio from './formradio.vue';
import formcheckbox from './formcheckbox.vue';
import formtableselector from './formtableselector';
import formtableinputer from './formtableinputer';
import formdate from './formdate.vue';
import formtime from './formtime.vue';
import formlink from './formlink.vue';
import formrate from './formrate.vue';
import formuserselect from './formuserselect.vue';
import formtreeselect from './formtreeselect.vue';
import formaccounts from './formaccounts';
import formupload from './formupload.vue';
import formdivider from './formdivider';
import formcube from './formcube.vue';
import formtab from './formtab.vue';
import formcollapse from './formcollapse.vue';
import formtable from './formtable.vue';

import * as cmdbComponent from '@/views/pages/cmdb/form/component';
import * as autoexecComponent from '@/views/pages/autoexec/form/component';

let importComponentConfig = {};
try {
  // 导入自定义组件
  const componentConfig = require.context('@/commercial-module', true, /formcomponent.js$/);
  componentConfig
    .keys()
    .forEach(path => {
      importComponentConfig = Object.assign(importComponentConfig, componentConfig(path).default || {});
    });
} catch (error) {
  console.error('form/component/index.js异常', error);
}

export default {
  formlabel,
  formtext,
  formtextarea,
  formckeditor,
  formnumber,
  formpassword,
  formselect,
  formcascader,
  formradio,
  formcheckbox,
  formtableselector,
  formtableinputer,
  formdate,
  formtime,
  formlink,
  formrate,
  formuserselect,
  formtreeselect,
  formaccounts,
  formupload,
  formdivider,
  formcube,
  formtab,
  formcollapse,
  formtable,
  ...cmdbComponent,
  ...autoexecComponent,
  ...importComponentConfig
};
