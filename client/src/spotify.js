import axios from './config/axiosConfig';

// map for localStorage keys
const LOCALSTORAGE_KEYS = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  expireTime: 'spotify_token_expire_time',
  timestamp: 'spotify_token_timestamp',
};

// Map to retrieve localStorage values
const LOCALSTORAGE_VALUES = {
  acessToken: localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  refreshToken: localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
  expireTime: localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
  timestamp: localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};

export const logout = () => {
  // clear localStorage items
  for (const property in LOCALSTORAGE_KEYS) {
    localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
  }

  // navigate to homepage
  window.location = window.location.origin;
};

/** 
check if the amount time that has elapsed between the timestam in localStorage and now is
is greater than the expiratio time of 3600 seconds (1 hour)
@returns { boolean } Wether or not the access token in localStorage has expired
*/
const hasTokenExpired = () => {
  const { acessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES;

  if (!acessToken || !timestamp) {
    return false;
  }

  const milisecoundElapsed = Date.now() - Number(timestamp);
  return milisecoundElapsed / 1000 > Number(expireTime);
};

const refreshToken = async () => {
  try {
    // logout of there's no refresh token stored or we've managed to get into a reload infinite loop
    if (
      !LOCALSTORAGE_VALUES.refreshToken ||
      LOCALSTORAGE_VALUES.refreshToken === 'undefined' ||
      Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000 > 1000
    ) {
      console.error('No refresh token avaliable');
      logout();
    }

    // use /refresh_token endpoint from or Node app
    const { data } = await axios.get(
      `/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`
    );

    // update localStorage values
    localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.acess_token);
    localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

    // reload  the page for localStorage update to be reflected
    window.location.reload();
  } catch (error) {
    console.error(error);
  }
};

/**
 * handles logic for retrieving the Spotify access token from localStorage or URL query params
 * @returns {string} A Spotify access token
 */
const getAcessToken = () => {
  // debugger;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const queryParams = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
  };
  const hasError = urlParams.get('error');

  // if there's an error OR the token in localStorage has expired, refresh the token
  if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.acessToken === 'undefined') {
    refreshToken();
  }

  // if there's a valid access token in localStorage, use that
  if (LOCALSTORAGE_VALUES.acessToken && LOCALSTORAGE_VALUES.acessToken !== 'undefined') {
    return LOCALSTORAGE_VALUES.acessToken;
  }

  // if there is a token in the URL query params, use is loggin in for the first time
  if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    // store the query params in localStorage
    for (const property in queryParams) {
      localStorage.setItem(property, queryParams[property]);
    }

    // set timestamp
    localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
    return queryParams[LOCALSTORAGE_KEYS.accessToken];
  }

  // we should never get here
  return false;
};

export const acessToken = getAcessToken();

axios.defaults.headers.common['Authorization'] = `Bearer ${acessToken}`;

/**
 * Get Current User's Profile
 * @returns { Promise }
 */
export const getUserProfile = () => axios.get('/me');

export const getCurrentUserPlaylists = (limit = 20) => {
  return axios.get(`/me/playlists?limit=${limit}`);
};

export const getTopArtists = (time_range = 'short_term') => {
  return axios.get(`/me/top/artists?time_range=${time_range}`);
};

export const getTopTracks = (time_range = 'short_term') => {
  return axios.get(`/me/top/tracks?time_range=${time_range}`);
};

export const getPlaylist = (playlist_id) => {
  return axios.get(`/playlists/${playlist_id}`);
}

export const getAudioFeaturesForTracks = ids => {
  return axios.get(`/audio-features?ids=${ids}`);
};