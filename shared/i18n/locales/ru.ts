import type en from './en';
import type { LocaleShape } from '../locale-shape';

const ru: LocaleShape<typeof en> = {
  navigationBar: {
    contacts: 'Контакты',
    calls: 'Звонки',
    settings: 'Настройки',
  },
  auth: {
    emailPlaceholder: 'Введите email',
    codeSentTo: 'Код отправлен на',
    codePlaceholder: 'Код',
    resendCode: 'Отправить код повторно',
    resendCodeIn: 'Повторная отправка через {{seconds}} с',
  },
  settings: {
    loggedIn: 'Выполнен вход',
    logOut: 'Выйти',
    profile: 'Профиль',
    devices: 'Устройства',
    about: 'О приложении',
  },
  errors: {
    INVALID_EMAIL: 'Некорректный email',
    INVALID_OTP: 'Неверный или просроченный код',
    REFRESH_TOKEN_REVOKED: 'Сессия истекла — войдите снова',
    SESSION_NOT_FOUND: 'Сессия не найдена',
    CANNOT_ADD_SELF: 'Нельзя добавить самого себя в контакты',
    CONTACT_ALREADY_EXISTS: 'Этот человек уже есть в контактах',
    CONTACT_NOT_FOUND: 'Контакт не найден',
    CANNOT_CALL_SELF: 'Нельзя позвонить самому себе',
    USER_NOT_REACHABLE: 'Этот человек сейчас недоступен',
    ROOM_NOT_FOUND: 'Звонок не найден',
    CALL_NOT_FOUND: 'Звонок не найден',
    DEVICE_NOT_FOUND: 'Устройство не найдено',
    USER_NOT_FOUND: 'Пользователь не найден',
    INVALID_REQUEST: 'Некорректный запрос',
    UNAUTHORIZED: 'Нужно войти снова',
    RATE_LIMITED: 'Слишком много попыток — попробуйте позже',
    INTERNAL_ERROR: 'Что-то пошло не так — попробуйте снова',
  },
  networkError: 'Нет подключения к интернету',
  unknownError: 'Что-то пошло не так — попробуйте снова',
};

export default ru;
