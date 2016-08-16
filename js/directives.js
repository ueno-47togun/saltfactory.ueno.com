angular.module('app.directives', [])

.directive('myTabs', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function ($scope) {
            var tabs = $scope.tabs = [];

            $scope.select = function (tab) {
                angular.forEach(tabs, function (tab) {
                    tab.selected = false;
                });
                tab.selected = true;
                $scope.$emit('my-tabs-changed', tab);
            };

            this.addTab = function (tab) {
                if (tabs.length === 0) {
                    $scope.select(tab);
                }
                tabs.push(tab);
            };
        },
        templateUrl: 'views/common/my-tabs.html'
    };
})
.directive('backImg',['resizer',function (resizer) {
    return {
        scope: '=',
        controller:['$scope', '$element', '$attrs',function ($scope, $element, $attrs) {
            $scope.$watch($attrs.backImg, function (url) {
                if (url) {
                    var content = $element.find('a');
                    content.css({
                        'background-image': 'url(' + resizer(url,360) + ')'
                    });
                }
            });

        }]
    }
}])
.directive('myTab', function () {
    return {
        require: '^myTabs',
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@'
        },
        link: function (scope, element, attrs, tabsCtrl) {
            tabsCtrl.addTab(scope);
        },
        templateUrl: 'views/common/my-tab.html'
    };
})

.directive('validPin',['$http',function ($http) {
    return {
        require: 'ngModel',
        link: function (scope, ele, attrs, c) {
            scope.$watch(attrs.ngModel, function (pinValue) {
                if (pinValue == "12345") {
                    c.$setValidity('valid-pin', true);
                }
                else {
                    c.$setValidity('valid-pin', false);
                }
            });
        }
    };
}])


.directive('showHideContainer', function () {
    return {
        scope: {
        },
        controller: ['$scope', '$element', '$attrs',function ($scope, $element, $attrs) {
            $scope.show = false;

            $scope.toggleType = function ($event) {
                $event.stopPropagation();
                $event.preventDefault();

                $scope.show = !$scope.show;

                // Emit event
                $scope.$broadcast("toggle-type", $scope.show);
            };
        }],
        templateUrl: 'views/common/show-hide-password.html',
        restrict: 'A',
        replace: false,
        transclude: true
    };
})


.directive('showHideInput', function () {
    return {
        scope: {
        },
        link: function (scope, element, attrs) {
            // listen to event
            scope.$on("toggle-type", function (event, show) {
                var password_input = element[0],
						input_type = password_input.getAttribute('type');

                if (!show) {
                    password_input.setAttribute('type', 'password');
                }

                if (show) {
                    password_input.setAttribute('type', 'text');
                }
            });
        },
        require: '^showHideContainer',
        restrict: 'A',
        replace: false,
        transclude: false
    };
})


.directive('biggerText',['$ionicGesture', function ($ionicGesture) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $ionicGesture.on('touch', function (event) {
                event.stopPropagation();
                event.preventDefault();

                var text_element = document.querySelector(attrs.biggerText),
						root_element = document.querySelector(".menu-content"),
						current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
						current_size = parseFloat(current_size_str),
						new_size = Math.min((current_size + 2), 24),
						new_size_str = new_size + 'px';

                root_element.classList.remove("post-size-" + current_size_str);
                root_element.classList.add("post-size-" + new_size_str);
            }, element);
        }
    };
}])

.directive('smallerText',['$ionicGesture', function ($ionicGesture) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $ionicGesture.on('touch', function (event) {
                event.stopPropagation();
                event.preventDefault();

                var text_element = document.querySelector(attrs.smallerText),
				root_element = document.querySelector(".menu-content"),
				current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
				current_size = parseFloat(current_size_str),
				new_size = Math.max((current_size - 2), 12),
				new_size_str = new_size + 'px';

                root_element.classList.remove("post-size-" + current_size_str);
                root_element.classList.add("post-size-" + new_size_str);
            }, element);
        }
    };
}])
//Use this directive to open external links using inAppBrowser cordova plugin
.directive('dynamicAnchorFix',['$ionicGesture', '$timeout', '$cordovaInAppBrowser', function ($ionicGesture, $timeout, $cordovaInAppBrowser) {
    return {
        scope: {},
        link: function (scope, element, attrs) {
            $timeout(function () {
                var anchors = element.find('a');
                if (anchors.length > 0) {
                    angular.forEach(anchors, function (a) {

                        var anchor = angular.element(a);

                        anchor.bind('click', function (event) {
                            event.preventDefault();
                            event.stopPropagation();

                            var href = event.currentTarget.href;
                            var options = {};

                            //inAppBrowser see documentation here: http://ngcordova.com/docs/plugins/inAppBrowser/

                            $cordovaInAppBrowser.open(href, '_blank', options)
								.then(function (e) {
								    // success
								})
								.catch(function (e) {
								    // error
								});
                        });

                    });
                }
            }, 10);
        },
        restrict: 'A',
        replace: false,
        transclude: false
    };
}])


.directive('multiBg', function (_) {
    return {
        scope: {
            multiBg: '=',
            interval: '=',
            helperClass: '@'
        },
        controller: ['$scope', '$element', '$attrs',function ($scope, $element, $attrs) {
            $scope.loaded = false;
            var utils = this;

            this.animateBg = function () {
                // Think i have to use apply because this function is not called from this controller ($scope)
                $scope.$apply(function () {
                    $scope.loaded = true;
                    $element.css({ 'background-image': 'url(' + $scope.bg_img + ')' });
                });
            };

            this.setBackground = function (bg) {
                $scope.bg_img = bg;
            };

            if (!_.isUndefined($scope.multiBg)) {
                if (_.isArray($scope.multiBg) && ($scope.multiBg.length > 1) && !_.isUndefined($scope.interval) && _.isNumber($scope.interval)) {
                    // Then we need to loop through the bg images
                    utils.setBackground($scope.multiBg[0]);
                }
                else {
                    // Then just set the multiBg image as background image
                    utils.setBackground($scope.multiBg[0]);
                }
            }
        }],
        templateUrl: 'views/common/multi-bg.html',
        restrict: 'A',
        replace: true,
        transclude: true
    };
})


.directive('bg', function () {
    return {
        restrict: 'A',
        require: '^multiBg',
        scope: {
            ngSrc: '@'
        },
        link: function (scope, element, attr, multiBgController) {
            element.on('load', function () {
                multiBgController.animateBg();
            });
        }
    };
})

.directive('preImg', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            ratio: '@',
            helperClass: '@'
        },
        controller: ['$scope', '$element', '$attrs',function ($scope, $element, $attrs) {
            $scope.loaded = false;

            this.hideSpinner = function () {
                // Think i have to use apply because this function is not called from this controller ($scope)
                $scope.$apply(function () {
                    $scope.loaded = true;
                });
            };
        }],
        templateUrl: 'views/common/pre-img.html'
    };
})

.directive('spinnerOnLoad', function () {
    return {
        restrict: 'A',
        require: '^preImg',
        scope: {
            ngSrc: '@'
        },
        link: function (scope, element, attr, preImgController) {
            element.on('load', function () {
                preImgController.hideSpinner();
            });
        }
    };
})


;
