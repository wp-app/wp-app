module.exports = function($sce) {

  'ngInject';
  return function(json) {

    var cleaned = json.replace(/&quot;/g,'"');

    return cleaned;

  }

}
