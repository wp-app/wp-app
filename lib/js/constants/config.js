module.exports = {
  "exposeAsideWhen": "(min-width:900px)",
  "camera": {
    "uploadurl":"http://10.0.1.3/",
    "sourceType": 1,
    "allowEdit": false,
    "correctOrientation": true,
  },
  "cache": {
    "img": {
      "debug": false,
      "localCacheFolder": "imgcache",
      "useDataURI": false,
      "chromeQuota": 10485760,
      "usePersistentCache": true,
      "cacheClearSize": 0,
      "headers": {},
      "skipURIencoding": false
    }
  },
  "posts": {
    "query": {
      "per_page": 5,
      "orderby": "date",
      "order": "desc",
      "post_status": "publish",
    }
  },
  "pages": {
    "query": {
      "per_page": 5,
      "orderby": "date",
      "order": "desc"
    }
  },
  "translation": {
    "available": {
      "en": {
        "en_*": "en"
      },
      "nl": {
        "nl_*": "nl"
      }
    },
    "prefered": "en"
  }
}
