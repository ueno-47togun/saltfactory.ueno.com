var home = 'app.home.playlist.index';
angular.module('app.controllers', [])

.controller('AuthCtrl',['$scope', '$ionicConfig',function ($scope, $ionicConfig) {

}])
.controller('ChangePasswordCtrl',['$scope', '$ionicConfig',function ($scope, $ionicConfig) {

}])
.controller('SignoutCtrl', ['$scope', '$state', '$rootScope', 'Api', function ($scope, $state, $rootScope, api) {
    api.logout();
    $state.go('auth.login');
}])
.controller('TermsCtrl',['$scope', '$ionicConfig',function ($scope, $ionicConfig) {

}])
// APP 
.controller('AppCtrl',  ['$scope', '$state', '$rootScope', 'Api', function ($scope, $state, $rootScope, api) {
    
    api.isLoggedIn(function (result) {
        if (!result) {
            $state.go('auth.login');
        }
    });

    $scope.goToProfile = function () {
        $state.go("app.profileEdit");
    }



}])
.controller('ExternalCtrl', function ($scope) {

})
.controller('EditProfileCtrl', ['$scope', '$state', '$rootScope', 'Api','resizer', function ($scope, $state, $rootScope, api) {

    $scope.selectLanguage = function (lang) {
        $scope.record.LanguageID = lang;
    }

    api.getProfile().then(function (result) {
        result.Extra = result.Extra || {};
        result.Extra.banner = result.Extra.banner || ''
        result.Birthday=moment(result.Birthday)._d;
        $scope.record = result;
    });

    $scope.updatePicture = function (file) {
        $scope.record.Picture = file.url;
    }
    $scope.updateBanner = function (file) {
        $scope.record.Extra.banner=file.url;
    }

    $scope.saveProfile = function (profile,hasExtra) {
        var obj = angular.copy(profile);
        $scope.error=null;
        if(!profile.FirstName && !profile.Surname){
            $scope.error='First and Last name required';
            return;
        }
        $scope.saving = true;
        api.updateProfile(obj).then(function (result) {
            $scope.saving = false;
            $rootScope.me = result;
        });
    }

}])
.controller('UploadCtrl', ['$scope', '$state', 'Api', function ($scope, $state, api) {
    $scope.updateMeta = function (file) {
        var tmp = angular.copy(file.meta);
        tmp.id = file.programme;
        file.saving=true;
        api.updateMeta(tmp).then(function(){
            file.msg = 'Thanks for contributing. your video will be reviewed and available shortly!';
            file.saving=false;
        });
    }
}])                               
//LOGIN
.controller('LoginCtrl', ['$scope', '$state', '$rootScope', 'Api', 'authService', function ($scope, $state, $rootScope, api, authService) {

    api.isLoggedIn(function (result) {
        if (result) {
            $rootScope.me = result;
            $state.go(home);
        }
    });

    $scope.authExternalProvider = function (provider) {
        var redirectUri = location.protocol + '//' + location.host + '/complete.html';
        var externalProviderUrl = api.config().serviceBase + "account/externallogin?provider=" + provider
                                                                    + "&response_type=token&client_id=" + api.config().id
                                                                    + "&returnUrl=" + redirectUri;
        window.$windowScope = $scope;                                                                                     
        var oauthWindow = window.open(externalProviderUrl, "Authenticate Account", "location=0,status=0,width=600,height=750");
    };


    $scope.authCompletedCB = function (fragment) {
        $scope.$apply(function () {                           
            if (fragment.haslocalaccount == 'false') {
                authService.logOut();
                authService.externalAuthData = {
                    provider: fragment.provider,
                    userName: fragment.external_user_name,
                    externalAccessToken: fragment.external_access_token
                };
                $scope.error = "Account already exists with this email, you can login and connect "+fragment.provider.split(":")[0]+" account.";
            }
            else {
                //Obtain access token and redirect to orders
                api.externalLogin(fragment.provider, fragment.external_access_token, "external_access_token").then(function (result) {
                    $rootScope.me = result;
                    if (!result) {
                        $scope.error = "unable to login : " + JSON.strigify(result);
                    } else {
                        $state.go(result.home);
                    }
                }, handleError);
            }
        });
    }


    function handleError(err) {
        $scope.error = err;
    }


    $scope.doLogIn = function (user) {
        $scope.error = '';
        api.login(user.email, user.password).then(function (result) {
            $rootScope.me = result;
            $state.go(home);
        }, handleError);
    };

    $scope.user = {};

}])

.controller('SignupCtrl', ['$scope', '$state', '$rootScope', 'Api', function ($scope, $state, $rootScope, api) {

    $scope.user = {};
    $scope.loading = { login: false };
    function handleError(err) {                                                            
        $scope.loading.login = false;
        $scope.errors = err;
    }

    function doLogIn(user) {
        delete $scope.errors;
        $scope.loading.login = true;
        api.login(user.email, user.password).then(function (result) {
            $scope.loading.login = false;
            $rootScope.me = result;
            $state.go(home);
        }, handleError);
    };

    $scope.doSignup = function (user) {
        api.register(user.email, user.password).then(function (data) {
            if (data.Succeeded) {
                doLogIn(user);
            } else {
                handleError(data.Errors);
            }
        }, handleError);
    };
}])

.controller('ForgotPasswordCtrl',['$scope', '$state','Api', function ($scope, $state,api) {
    $scope.doForgot = function (email,branding) {
        api.forgot(email,branding).then(function(result){
            if(result.Title=='Password Sent'){
                $state.go('auth.reset-password',{params:{email:email}});
            }
        });
    };

    $scope.user = {};
}])

.controller('ResetPasswordCtrl',['$scope', '$state','Api','$stateParams', function ($scope, $state,api,$stateParams) {
    console.log($stateParams);
    $scope.user={userName:$stateParams.email,key:'',password:''};
    $scope.resetPassord = function (model) {
        model.confirmPassword=model.password;
        api.resetPassword(model).then(function(result){
            if(result.Succeeded){
                $scope.result="Password Changed Successfully.";
            }else{
                $scope.result=result.Errors.join(',');
            }
        });
    };
}])

.controller('PlaylistCtrl', ['$scope', '$state', 'Api', function ($scope, $state, api) {

    function loadRecords() {
        api.playlists().then(function (records) {
            $scope.records = records;
        })
    }

    $scope.goToSearch = function () {
        $state.go("search");
    }

    loadRecords();

}])
.controller('PlaylistItemsCtrl', ['$scope', '$state', '$stateParams', 'Api', function ($scope, $state, $stateParams, api) {

    var pg = 1;
    $scope.records = [];
    $scope.loading = false;

    function loadRecords(id) {
        $scope.loading = true;
        $scope.playlistId = id;
        api.videosByPlaylist(id, pg).then(function (records) {
            $scope.records=records;
            $scope.loading = false;
        },function(err){
            $scope.error=err;
            $scope.loading = false;
        });
    }

    loadRecords($stateParams.id);

}])
.controller('WatchCtrl', ['$scope', '$state', '$stateParams', 'Api', '$sce','authService','$rootScope', function ($scope, $state, $stateParams, api, $sce,authService,$rootScope) {
    $scope.loading=true;
    var videoId = parseInt($stateParams.id);
    var playlistId = parseInt($stateParams.playlist);
    $scope.comment={
        programmeId:videoId,
        message:''
    }
    $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
    }
    $scope.watchUrl = 'rich/video/' + videoId + '?autostart=true';
    $scope.toggleLike = function (record) {
        if(!record) return;
        record.social=record.social||{};
        if (record.social.Like != 1) {
            api.likeVideo(record.mediaid);
            record.social.Like = 1;
        } else {
            api.unlikeVideo(record.mediaid);
            record.social.Like = -1;
        }
    }
    $scope.toggleLater = function (record) {
        if(!record) return;
        record.social=record.social||{};
        if (record.social.Later != 1) {
            api.watchLater(record.mediaid);
            record.social.Later = 1;
        } else {
            api.removeWatchLater(record.mediaid);
            record.social.Later = -1;
        }
    }
    $scope.rateVideo = function (record, stars) {
        api.starVideo(record.mediaid, stars);
        record.star = stars;

        var range = [];
        for(var i=0;i<star;i++) {
         range.push(i);
         }
        record.range = range;
    }
    function addComment(comment){
        api.commentOnVideo(comment).then(function(comments){
            $scope.comments=comments;
            comment.message='';
        });
    }
    $scope.addComment=addComment;
    
    $scope.programmeCreated=function(prg){
        addComment({programmeId:videoId,message:"",richContentId:'video/'+prg})
    }
    $scope.receiveEncoding=function(file){
        $scope.encoding=file;
    }
    $scope.toggleTab=function(tab){
        $scope.tab=tab;
    }
    
     $scope.authExternalProvider = function (provider) {
        var redirectUri = location.protocol + '//' + location.host + '/complete.html';
        var externalProviderUrl = api.config().serviceBase + 'connect/' + provider
                                                                    + "?response_type=token&client_id=" + api.config().id
                                                                    + "&auth_token="+api.token().access_token
                                                                    + "&returnUrl=" + redirectUri;
        window.$windowScope = $scope;                                                                                     
        var oauthWindow = window.open(externalProviderUrl, "Connect Account", "location=0,status=0,width=600,height=750");
    };


    $scope.authCompletedCB = function (fragment) {
        $scope.$apply(function () {
            console.log(fragment);
            if (fragment.connected == 'true') {
                api.me(true).then(function(result){
                   $rootScope.me=result; 
                });
            }else if(fragment.message=='Error'){
                $scope.error=fragment.values;
            }
        });
    }
    
    $scope.postOnFacebook=function(video,url){
        $scope.fb=true;
        api.postFacebook(video,url).then(function(result){
            $scope.fb=false;
        });
    }

    $scope.postOnTwitter=function(video,url){
        $scope.twt=true;
        api.postTwitter(video,url).then(function(result){
            $scope.twt=false;
        });
    }

    $scope.postOnGoogle=function(video,url){
        $scope.gplus=true;
        api.postGoogle(video,url).then(function(result){
            $scope.gplus=false;
        });
    }


    function handleError(err) {
        $scope.error = err;
    }
    
    
    api.videoById(playlistId, videoId).then(function (records) {
        var video=records[0];
        api.socialsByVideos([videoId]).then(function (likes) {
            $scope.loading = false;
            video.social=likes && likes[0];
            $scope.video = video;
            $scope.tab='vidcomment';
            api.commentsByVideoId(videoId).then(function (comments) {
                $scope.comments=comments;
            });
        });
    });

    
}])

.controller('SendCtrl',['$scope', function ($scope) {

    $scope.sendMail = function () {
        cordova.plugins.email.isAvailable(
			function (isAvailable) {
			    // alert('Service is not available') unless isAvailable;
			    cordova.plugins.email.open({
			        to: 'envato@startapplabs.com',
			        cc: 'hello@startapplabs.com',
			        // bcc:     ['john@doe.com', 'jane@doe.com'],
			        subject: 'Greetings',
			        body: 'How are you? Nice greetings from IonFullApp'
			    });
			}
		);
    };
}])

// SETTINGS
.controller('SettingsCtrl',['$scope', '$ionicActionSheet', '$state', function ($scope, $ionicActionSheet, $state) {
    $scope.airplaneMode = true;
    $scope.wifi = false;
    $scope.bluetooth = true;
    $scope.personalHotspot = true;

    $scope.checkOpt1 = true;
    $scope.checkOpt2 = true;
    $scope.checkOpt3 = false;

    $scope.radioChoice = 'B';

    // Triggered on a the logOut button click
    $scope.showLogOutMenu = function () {

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            //Here you can add some more buttons
            // buttons: [
            // { text: '<b>Share</b> This' },
            // { text: 'Move' }
            // ],
            destructiveText: 'Logout',
            titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                //Called when one of the non-destructive buttons is clicked,
                //with the index of the button that was clicked and the button object.
                //Return true to close the action sheet, or false to keep it opened.
                return true;
            },
            destructiveButtonClicked: function () {
                //Called when the destructive button is clicked.
                //Return true to close the action sheet, or false to keep it opened.
                $state.go('auth.login');
            }
        });

    };
}]);
