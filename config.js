/* Optional public browser configuration. No private credentials belong here. */
window.GlobeConfig = window.GlobeConfig || {
  mapboxToken: '',
  // HTTPS Nominatim-compatible search endpoint, e.g. your own service or proxy.
  // Keep empty for local presets and coordinates only. See README before enabling.
  geocodingEndpoint: ''
};
