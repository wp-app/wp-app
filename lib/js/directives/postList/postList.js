module.exports = function() {
  return {
    restrict: 'E',
    transclude: true,
    //   replace: true,
    scope: {
      searchText: '=',
      filters: '='
    },
    template: require("./postList.html"),
    compile: function(tElement, tAttrs, transclude) {
      return function($scope, $element) {
        transclude($scope, function(clone) {
          angular.element($element[0].querySelector('.list-container')).append(clone);
        });
      };
    },
    bindToController: true,
    controllerAs: 'postListCtrl',
    controller: function($log, $scope, $rootScope, $attrs, $injector, CONFIG, $q, CacheFactory) {
      'ngInject';
      var isLoadingMore = false,
        vm = this;
      // Inputs
      vm.type = (typeof $attrs.type !== 'undefined') ? $attrs.type : 'post'; // type | page
      vm.perPage = (typeof $attrs.perPage !== 'undefined') ? parseInt($attrs.perPage) : 8;
      vm.infiniteScroll = (typeof $attrs.infiniteScroll !== 'undefined') ? ($attrs.infiniteScroll === 'true') : true;
      vm.immediateCheck = (typeof $attrs.immediateCheck !== 'undefined') ? ($attrs.immediateCheck === 'true') : true;
      // internal
      vm.list = null;
      vm.page = 1;
      vm.isPaginationOver = false;
      vm.searching = false;
      vm.loadMore = ionic.throttle(doLoadMore, 1000);

      $log.debug(vm.type + vm.page);

      if (!CacheFactory.get('postCache')) {
        CacheFactory.createCache('postCache');
      }

      var postCache = CacheFactory.get('postCache');

      $scope.$watch('postListCtrl.searchText', function(newValue, oldValue) {
        if (!newValue || newValue === '') {
          return;
        }
        // redefine vm.type so type can be dynamic, like this: ui-sref="app.search({searchType: 'bestemming'})"
        vm.type = (typeof $attrs.type !== 'undefined') ? $attrs.type : 'post';
        vm.searching = true;
        reset();
        doLoadMore().then(function() {
          vm.searching = false;
        });
      });

      // Listen to any pull to refresh that could happen in the page
      $scope.$on('scroll.refreshStart', refresh);
      // Allow a reload from out
      $scope.$on('postList.reload', reload);

      $log.debug('postList directive running', vm);
      init();

      function reload(e) {
        reset();
        doLoadMore();
      }

      function init() {
        if (!vm.infiniteScroll && vm.immediateCheck) {
          doLoadMore();
        }
      }

      function refresh() {
        getService().getList(getQuery(1)).then(function(response) {
          
          var newPosts = [],
            latestId = vm.list[0].id,
            len = response.data.length,
            i = 0;

          for (; i < len; i++) {
            var post = response.data[i];
            if (post.id === latestId) {
              break;
            }
          }

          if (i > 0) {
            newPosts = response.data.slice(0, i);
          }

          if (newPosts.length) {
            vm.list = newPosts.concat(vm.list);
          }

          angular.forEach( response.data, function( post, i) {
            
            postCache.put(post.id,post);
            
          });
          $rootScope.$broadcast('scroll.refreshComplete');
        });
      }

      function reset() {
        vm.list = null;
        isLoadingMore = false;
        vm.page = 1;
        vm.isPaginationOver = false;
      }

      function doLoadMore() {
        // prevent multiple call when the server takes some time to answer
        if (isLoadingMore || vm.isPaginationOver) {
          return $q.when(null);
        }
        isLoadingMore = true;
        return getService().getList(getQuery()).then(function(response) {
          vm.page++;
          vm.list = (vm.list) ? vm.list.concat(response.data) : response.data;
          vm.isPaginationOver = (response.data.length == 0 || response.data.length < vm.perPage);
          // Add posts to cache by id
          angular.forEach( response.data, function( post, i) {
            postCache.put(post.id,post);
          });
          $log.debug(response.data);
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).finally(function() {
          isLoadingMore = false;
        });
      }

      function getService() {
        switch (vm.type) {
          case 'post':
            return $injector.get('$wpApiPosts');
            break;
          case 'page':
            return $injector.get('$wpApiPages');
            break;
          default:
            return $injector.get('$wpApiCustom').getInstance(vm.type);
            return null;
        }
      }

      function getQuery(page) {
        var query = {
          "_embed": true,
          page: page || vm.page,
          per_page: vm.perPage,
        };
        if (vm.searchText) {
          query['filter[s]'] = vm.searchText;
        }
        angular.forEach(vm.filters, function(list, filterName){
            query["filter[" + filterName + "]"] = list;
        });
        switch (vm.type) {
          case 'post':
            angular.merge(CONFIG.posts.query, query);
            break;
          case 'page':
            angular.merge(CONFIG.pages.query, query);
            break;
        }
        return query;
      }
    }
  };
}
