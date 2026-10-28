import { createElement } from 'react';
import { SPORT_ICON_OPTIONS } from '../utils/sportIcons';

const iconByKey = new Map(SPORT_ICON_OPTIONS.map((option) => [option.key, option.Icon]));

export default function SportIcon({ name = 'soccer', className }) {
  const Icon = iconByKey.get(name) || iconByKey.get('soccer');
  return createElement(Icon, { className, 'aria-hidden': 'true', focusable: 'false' });
}
