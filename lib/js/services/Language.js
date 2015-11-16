module.exports = angular.module('wpapp.services').provider('LanguageService',  function(CONFIG, $translateProvider) {
  'ngInject';

    var language, languages, languagesMapping, languagesTranslated, mapping;
    languages = [];
    languagesTranslated = {};
    languagesMapping = {};

    angular.forEach(CONFIG.translation.available, function(mapping, language) {
      languages.push(language);
      languagesTranslated[language] = 'languages.' + language;
      angular.extend(languagesMapping, mapping);
    });

    return {
      getPreferredLanguage,
      getLanguages,
      getLanguagesMapping,
      $get: ['amMoment', function(amMoment) {
        return {
          locale: localStorage.getItem("locale") || 'en',
          getPreferredLanguage,
          getLanguages,
          getLanguagesMapping,
          getLanguagesList: function() {
            return languagesTranslated;
          },
          hasLocale: function() {
            return localStorage.getItem("locale");
          },
          getLocale: function() {
            return this.locale;
          },
          setLocale: function(locale) {
            this.locale = locale;
            localStorage.setItem("locale", this.locale);
            $translateProvider.use(this.locale);
            return amMoment.changeLocale(this.locale);
          }
        };
      }]
    };

    function getPreferredLanguage() {
      return CONFIG.translation.prefered;
    }

    function getLanguages() {
      return languages;
    }

    function getLanguagesMapping() {
      return languagesMapping;
    }
  }).config(function($translateProvider, LanguageServiceProvider) {
    'ngInject';
    var i, language, languages;
    languages = LanguageServiceProvider.getLanguages();
    for (i in languages) {
        language = languages[i];
        $translateProvider.translations(language, require('../../translations/' + language + '.json'));
    }
    return $translateProvider
      .preferredLanguage(LanguageServiceProvider.getPreferredLanguage())
      .registerAvailableLanguageKeys(languages, LanguageServiceProvider.getLanguagesMapping())
      .fallbackLanguage('en')
      .useSanitizeValueStrategy('escape');
  }).run(function($log, LanguageService, $cordovaGlobalization, $ionicPlatform) {
    'ngInject';
    $ionicPlatform.ready(function() {
      // Set the prefered language from device settings
      if (window.cordova) {
        $cordovaGlobalization.getPreferredLanguage()
          .then(function(locale) {
            $log.info('Globalization locale', locale);
            locale = locale.value.substring(0, 2);
            if (LanguageService.hasLocale()) {
              return LanguageService.setLocale(LanguageService.getLocale());
            } else {
              return LanguageService.setLocale(locale);
            }
        }).catch(function (error){
            $log.info('Globalization locale error', error);
            if (LanguageService.hasLocale()) {
              return LanguageService.setLocale(LanguageService.getLocale());
            } else {
              return LanguageService.setLocale(LanguageService.getPreferredLanguage());
            }
          });
      } else {
        if (LanguageService.hasLocale()) {
          return LanguageService.setLocale(LanguageService.getLocale());
        } else {
          return LanguageService.setLocale(LanguageService.getPreferredLanguage());
        }
      }
    });
  });
