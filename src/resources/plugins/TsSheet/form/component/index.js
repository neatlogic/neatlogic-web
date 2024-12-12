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
import formexpression from './formexpression.vue';

import * as cmdbComponent from '@/views/pages/cmdb/form/component';
import * as autoexecComponent from '@/views/pages/autoexec/form/component';
import ComponentManager from '@/resources/import/component-manager.js';
let formComponent = ComponentManager.getFormComponentComponent() || {};
let formComponentConfig = {};
for (let key in formComponent) {
  if (key && formComponent[key] instanceof Array && formComponent[key].length > 0) {
    formComponent[key].forEach(item => {
      let {version = '', component} = item || {};
      if (version) {
        formComponentConfig[`${key}-${version}`] = component;
      }
    });
    let findDefaultVersion = formComponent[key].find(item => item.version === 'defaultVersion');
    formComponentConfig[key] = findDefaultVersion['component']; // 设置默认版本，兼容表单数据
  } else {
    formComponentConfig[key] = formComponent[key];
  }
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
  formexpression,
  ...cmdbComponent,
  ...autoexecComponent,
  ...formComponentConfig
};
