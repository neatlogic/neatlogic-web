import {$t} from '@/resources/init.js';

export default {
  controller: ['minute', 'hour', 'dayofmonth', 'dayofweek', 'month', 'year'],
  second: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'],
  minute: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'],
  hour: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
  dayofmonth: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
  month: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  dayofweek: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  dict: {
    minute: $t('page.minute'),
    hour: $t('page.hour'),
    dayofmonth: $t('page.day'),
    dayofweek: $t('page.week'),
    month: $t('page.month'),
    year: $t('page.year'),
    JAN: $t('page.january'),
    FEB: $t('page.february'),
    MAR: $t('page.march'),
    APR: $t('page.april'),
    MAY: $t('page.may'),
    JUN: $t('page.june'),
    JUL: $t('page.july'),
    AUG: $t('page.august'),
    SEP: $t('page.september'),
    OCT: $t('page.october'),
    NOV: $t('page.november'),
    DEC: $t('page.december'),
    SUN: $t('page.sunday'),
    MON: $t('page.monday'),
    TUE: $t('page.tuesday'),
    WED: $t('page.wednesday'),
    THU: $t('page.thursday'),
    FRI: $t('page.firday'),
    SAT: $t('page.saturday'),
    '*': $t('page.allofthem'),
    '?': $t('page.notdefine')
  },
  controllerList: {
    minute: [
      {
        type: 'label',
        text: $t('page.every')
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      }
    ],
    hour: [
      {
        type: 'label',
        text: $t('page.every')
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      },
      {
        type: 'label',
        text: ':'
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'minute',
        target: 'MINUTE',
        width: 380
      },
      {
        type: 'label',
        text: $t('page.minu')
      }
    ],
    dayofmonth: [
      {
        type: 'label',
        text: $t('page.every')
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'hour',
        target: 'HOUR',
        width: 380
      },
      {
        type: 'label',
        text: $t('page.hou')
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'minute',
        target: 'MINUTE',
        width: 380
      },
      {
        type: 'label',
        text: $t('page.minu')
      }
    ],
    dayofweek: [
      {
        type: 'label',
        text: $t('page.every')
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'dayofweek',
        target: 'DAYOFWEEK',
        width: 210
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'hour',
        target: 'HOUR',
        width: 380
      },
      {
        type: 'label',
        text: $t('page.hou')
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'minute',
        target: 'MINUTE',
        width: 490
      },
      {
        type: 'label',
        text: $t('page.minu')
      }
    ],
    month: [
      {
        type: 'label',
        text: $t('page.every')
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'dayofmonth',
        target: 'DAYOFMONTH',
        width: 380
      },
      {
        type: 'label',
        text: $t('page.da')
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'hour',
        target: 'HOUR',
        width: 380
      },
      {
        type: 'label',
        text: $t('page.hou')
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'minute',
        target: 'MINUTE',
        width: 380
      },
      {
        type: 'label',
        text: $t('page.minu')
      }
    ],
    year: [
      {
        type: 'label',
        text: $t('page.every')
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'month',
        target: 'MONTH',
        width: 205
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'dayofmonth',
        target: 'DAYOFMONTH',
        width: 380
      },
      {
        type: 'label',
        text: $t('page.da')
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'hour',
        target: 'HOUR',
        width: 380
      },
      {
        type: 'label',
        text: $t('page.hou')
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'minute',
        target: 'MINUTE',
        width: 380
      },
      {
        type: 'label',
        text: $t('page.minu')
      }
    ]
  }
};
