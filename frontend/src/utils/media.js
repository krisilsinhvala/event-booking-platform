import { apiOrigin } from './apiUrl';

const getMediaUrl = (source) => {
  if (!source || source.startsWith('http://') || source.startsWith('https://')) {
    return source;
  }

  return `${apiOrigin}${source.startsWith('/') ? source : `/${source}`}`;
};

export default getMediaUrl;