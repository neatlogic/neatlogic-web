import { $t } from '@/resources/init.js';

export default {
  name: 'flowline',
  label: $t('term.report.flowline'),
  type: 'flowline',
  icon: 'tsfont-chart-line',
  widgetType: 'effect',
  hasCustomConfig: true,
  supportAppearanceColor: true,
  width: 420,
  height: 48,
  padding: 0,
  color: '#00e5ff',
  accentColor: '#00ffa8',
  needData: false,
  config: {
    enabled: true,
    direction: 'horizontal',
    speed: 6,
    lineWidth: 3,
    isDashed: false,
    glow: true
  }
};
