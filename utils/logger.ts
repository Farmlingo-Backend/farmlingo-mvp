import util from 'util';

const LOG_PREFIX = '[farmlingo]';

export const info = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.log(LOG_PREFIX, util.format(...args));
};

export const warn = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.warn(LOG_PREFIX, util.format(...args));
};

export const error = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.error(LOG_PREFIX, util.format(...args));
};
