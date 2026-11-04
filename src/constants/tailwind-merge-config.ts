const DS_SPACING = ['none', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl']
const DS_RADIUS = ['none', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'pill']
const DS_SHADOW = ['xlg', '01']

export const tailwindMergeConfig = {
  extend: {
    theme: {
      spacing: DS_SPACING,
      radius: DS_RADIUS,
      shadow: DS_SHADOW,
      font: ['heading', 'text', 'sans'],
    },
    classGroups: {
      'font-size': [
        'text-d1',
        'text-d2',
        'text-d3',
        'text-h1',
        'text-h2',
        'text-h3',
        'text-h4',
        'text-h5',
        'text-h6',
        'text-body-18',
        'text-body-16',
        'text-body-14',
        'text-body-12',
        'text-overline-10',
      ],
    },
  },
}
