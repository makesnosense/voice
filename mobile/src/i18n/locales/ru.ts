import type en from './en';
import type { LocaleShape } from '../locale-shape';

const ru: LocaleShape<typeof en> = {
  navigationBar: {
    contacts: 'Контакты',
    calls: 'Звонки',
    settings: 'Настройки',
  },
};

export default ru;
