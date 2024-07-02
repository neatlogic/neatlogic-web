export default {
  groups: {
    top: {
      position: 'top',
      attrs: {
        circle: {
          magnet: true,
          class: 'port-hidden',
          r: 5
        }
      }
    },
    bottom: {
      position: 'bottom',
      attrs: {
        circle: {
          magnet: true,
          class: 'port-hidden',
          r: 5
        }
      }
    },
    left: {
      position: 'left',
      attrs: {
        circle: {
          magnet: true,
          class: 'port-hidden',
          r: 5
        }
      }
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          magnet: true,
          class: 'port-hidden',
          r: 5
        }
      }
    }
  },
  items: [
    {
      id: 'top',
      group: 'top'
    },
    {
      id: 'right',
      group: 'right'
    },
    {
      id: 'bottom',
      group: 'bottom'
    },
    {
      id: 'left',
      group: 'left'
    }
  ]
};
