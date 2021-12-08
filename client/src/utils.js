/**
 * High-order function for async/await erro handling
 * @param {function} fn as async function
 * @returns {function}
 */
export const catchErros = (fn) => {
  return function (...args) {
    return fn(...args).catch((err) => {
      console.error(err);
    });
  };
};

// usage catchErrors(fetchData());

/**
 * @param { number } ms number of milliseconds
 * @returns { string } formatted duration string
 * @example 216699 -> '3:36'
 */
export const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 6000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};
