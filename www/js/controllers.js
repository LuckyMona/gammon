
angular.module('starter.controllers', ['LocalStorageModule', 'ngStorage'])


// .controller('DashCtrl', function($scope) {})

// .controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

//   $scope.chats = Chats.all();
//   $scope.remove = function(chat) {
//     Chats.remove(chat);
//   };
// })
.controller('taskListCtrl', function($scope,$window, $timeout,localStorageService){
    // var href =  $window.location.href.split('#')[0] + "#/tab/taskList";
    var getTasklist = function(){
       $scope.tasklists = localStorageService.get('tasklistData');
       
    }
    getTasklist();


})
.controller('UploadsCtrl', function($rootScope, $scope, $stateParams, localStorageService, dbFactory, uploadFactory,$translateLocalStorage,$state, $ionicViewSwitcher, helpToolsFactory, $timeout) {
   
   // $scope.uploadItems = dbFactory.findAll('fe_Activity') || "";
   dbFactory.findAll('fe_Activity', function(results){
        //console.log();
        results.forEach(function(item, index, arr){
          //item.photoFirst =JSON.parse(item.photoObjs);
          item.photoFirst = JSON.parse(item.photoObjsStr.split('  ')[0]).imgURI;
        });
        $scope.uploadItems = results;
   });
   $scope.isUploadMaskShow = false;
   $scope.isUploadingShow = false;
   $scope.isStoppingShow = false;

    $scope.editItem = function(item){
      console.log(item);
      $rootScope.$broadcast('editItem', item);
      $state.go('tab.newAct');
      $ionicViewSwitcher.nextDirection("forward");
    }

   function toggleLang(){
      var oStartUpload = document.getElementById('startUpload');

      if(uploadFactory.isUploading()){
        $scope.isUploadMaskShow = true;
        $scope.isUploadingShow = true;
        $scope.isStoppingShow = false;

        oStartUpload.innerHTML = "<p>"+ helpToolsFactory.i18nT('STOP_UPLOAD1') + "</p><p class='no-mg'>"+ helpToolsFactory.i18nT('STOP_UPLOAD2') + "</p>";
      } else if(uploadFactory.isStopping()){
        $scope.isUploadMaskShow = true;
        $scope.isUploadingShow = false;
        $scope.isStoppingShow = true;

        oStartUpload.innerHTML = "<p>"+ helpToolsFactory.i18nT('STOPPING1') + "</p><p class='no-mg'>"+ helpToolsFactory.i18nT('STOPPING2') + "</p>";
      } else {
        $scope.isUploadMaskShow = false;
        $scope.isUploadingShow = false;
        $scope.isStoppingShow = false; //隐藏stopping，显示uploading

        oStartUpload.innerHTML = "<p>"+ helpToolsFactory.i18nT('START_UPLOAD1') + "</p><p class='no-mg'>"+ helpToolsFactory.i18nT('START_UPLOAD2') + "</p>";
      }
   }
   
   $rootScope.$on('changeLanguage',function(){
     toggleLang();
   });
   
   $rootScope.$on('uploadStatusChange',function(){
     toggleLang();

     $timeout(function() {
       toggleLang();            // TODO 很奇怪，为什么不会生效，要再来一次
     }, 200);
   });

   $scope.startUpload = function(){

      if (uploadFactory.isStopping()) {
        console.log('Stopping, dont click me!!!');
        return;

      } else if (uploadFactory.isUploading()) {
        console.log('Stop Upload clicked!');
        uploadFactory.stopUpload();
        toggleLang();

      } else {
        console.log('Start Upload clicked!');
        uploadFactory.coreUpload();
        toggleLang();
      }
   }

   $rootScope.$on('saveAct', function(){
        //$scope.uploadItems = localStorageService.get('actDatas');
        // console.log('on saveAct');
        dbFactory.findAll('fe_Activity', function(results){
            
            var i, len = results.length;
            for(i=0; i<len; i++){
              // var midArr = results[i].photos.split(',');
              // results[i].photos = midArr;
              if (results[i].photoObjsStr != "") {
                results[i].photoFirst = JSON.parse(results[i].photoObjsStr.split('  ')[0]).imgURI;
              } else {
                results[i].photoFirst = "";
              }
            }
            $scope.uploadItems = results;
            // console.log('$scope.uploadItems:'+$scope.uploadItems);
        });
        
   });
})

.controller('SystemCtrl', function($rootScope, $scope, $window,$timeout,localStorageService, $state, $ionicViewSwitcher, $translate, $localStorage,helpToolsFactory) {
  
    $scope.UID = localStorageService.get('UID');
    $scope.Name = localStorageService.get('Name');
    $scope.allow3G = localStorageService.get('allow3G')|| false;
    $scope.notification = localStorageService.get('notification') || false;

    var _localPhotoReso = localStorageService.get('photoReso');
    if(_localPhotoReso && _localPhotoReso === "Original Size"){
      $scope.photoResolution = helpToolsFactory.i18nT('ORIGINAL_SIZE');
    }else{
      $scope.photoResolution = _localPhotoReso || helpToolsFactory.i18nT('ORIGINAL_SIZE');
    }
    // $scope.isGray_language = false;
    // $scope.isGray_jobNumber = false;

    $scope.signOut = function(){
        
        // 删除字段：token / tasklistData / badgeTask
        localStorageService.remove('token','tasklistData','badgeTask');
        delete $localStorage.token;
        $state.go('login.active');
    }

    $rootScope.$on('jobNumberSelect', function(d, data){
        $scope.jobNumber = data;
    })
    $rootScope.$on('photoResoChange', function(d, data){
      if(data === "Original Size"){
        $scope.photoResolution = helpToolsFactory.i18nT('ORIGINAL_SIZE');
        var localPhotoReso = "Original Size";
        localStorageService.set('photoReso', localPhotoReso);
        return;
      }
      $scope.photoResolution = data;
      localStorageService.set('photoReso', data);
    });

    $rootScope.$on('loginSuccess', function()
    {
        //rebind the UID and Name
        $scope.UID = localStorageService.get('UID');
        $scope.Name = localStorageService.get('Name');
    });
    // var langKey = localStorageService.get('NG_TRANSLATE_LANG_KEY');
    var langKey = $translate.use();
    var getLang = function(langKey){
        if(langKey === "zh_hk"){
            $scope.lang = '繁體中文';
        } else {
           $scope.lang = 'English'; 
        }
    }
    getLang(langKey);

    $rootScope.$on('changeLanguage', function(d, data){
        getLang(data);
        $translate.use(data);
        if($scope.photoResolution === "原圖" || $scope.photoResolution ==="Original Size"){
          $scope.photoResolution = helpToolsFactory.i18nT('ORIGINAL_SIZE');
          localStorageService.set('photoReso', $scope.photoResolution);
        }
        
    });

    //当切换Allow 3G时触发
    $scope.$watch('allow3G', function(newVal, oldVal){
      console.log('change allow3G');
      console.log(newVal);
      localStorageService.set('allow3G',newVal);
      $rootScope.$broadcast('allow3G_Change', newVal);
     
    });
    $scope.$watch('notification', function(newVal, oldVal){
      console.log(newVal);
      localStorageService.set('notification',newVal);
    });
})
.controller('LangCtrl',function($rootScope, $scope, $state, $ionicViewSwitcher,$translateLocalStorage, $translate){
    // language.html页面单选后跳回来
    $scope.lan = $translate.use();
    $scope.$watch("lan", function(newVal,oldVal){
        
        if(newVal==oldVal){
          return;
        }
        $translateLocalStorage.set('NG_TRANSLATE_LANG_KEY',newVal);
        
        $rootScope.$broadcast('changeLanguage', newVal);
        /*console.log('sm_url:'+ $scope.m_url);*/
        $state.go('tab.system');
        $ionicViewSwitcher.nextDirection("back");
    });
    
})
.controller('TabCtrl', function($rootScope, $scope, localStorageService){
  
    $scope.badgeUpload = localStorageService.get('badgeUpload') || 0;
    $scope.uploadNum = localStorageService.get('badgeUpload') || 0;
    $rootScope.$on('updateBadgeUpload', function(d, data){
        $scope.badgeUpload = data;
        $scope.uploadNum = data;
    });

    $scope.badgeTask = localStorageService.get('badgeTask') || 0;
    $rootScope.$on('updateBadgeTask',function(d, data){
        $scope.badgeTask = data;
    });

    $scope.jobNumber = localStorageService.get('projectNo');
    $rootScope.$on('jobNumberSelect', function(d, data){
        $scope.jobNumber = data;
    })
})
.controller('PhotoCtrl', function($scope,localStorageService, $state, $ionicViewSwitcher, $rootScope){
  
  $scope.parent = {
    photoList:localStorageService.get('photoList'),
  }
  // 选择几张
  $scope.selectNum = 0;
  // 是否长按呼出选择icon
  $scope.isCallSelect = false;
  // 点击图片放大
  $scope.bigImage = false;
  $scope.showBigImg = function(index){
    if($scope.isCallSelect === false){
      console.log(index);
      $scope.parent.photoList.forEach(function(item, i, arr){
        if(item.index===index){
            $scope.bigImgUrl = item.originImgURI;
        }
      });
      $scope.bigImage = true;
    }
    return;
  }
  $scope.hideBigImg = function(){
    
    $scope.bigImage = false;
  }

  //$scope.isShowSelectIcon = false;

  // handler of on-hold event
  $scope.callSelect = function(photoItem){

    console.log('callSelect');
    $scope.parent.photoList.forEach(function(item, index, arr){
      item.isShowSelectIcon = true;
      item.isSelected = false;
    });
    $scope.selectNum = 1;
    photoItem.isSelected = true;
    $scope.isCallSelect = true;
  }

  $scope.doSelect = function(photoItem){
      console.log('doSelect');
      if($scope.isCallSelect === true){
          if(photoItem.isSelected === true){
            photoItem.isSelected = false;
             $scope.selectNum --;
          }else{
            photoItem.isSelected = true;
            $scope.selectNum ++;
          }
      }
      return;
  }

  $scope.deletePhoto = function(){
    var photoListArr = $scope.parent.photoList;
  /*  photoListArr.forEach(function(item, index, arr){
        if(item.isSelected ===true){
          arr.splice(index,1);
        }
    });*/

    var i=0;
    for(i; i<photoListArr.length; ){
      if(photoListArr[i].isSelected===true){
        photoListArr.splice(i,1);
      }else {i++;}
    }

    $scope.parent.photoList = photoListArr;
    $scope.isCallSelect = false;
    localStorageService.set('photoList',photoListArr);
    $rootScope.$broadcast('deletePhotoDone', $scope.parent.photoList);
    $state.go('tab.newAct');
    $ionicViewSwitcher.nextDirection("back");
  }

})
.controller('JobListCtrl', function($rootScope, $scope,localStorageService,$state,$ionicViewSwitcher, $ionicHistory, helpToolsFactory){
    
    $scope.jobListGoBack = function(){
      
        //$scope.jobList = localStorageService.get('jobList')||undefined;
        //console.log($scope.jobList);

        if((localStorageService.get('jobList')||undefined) === undefined){
          helpToolsFactory.showAlert(helpToolsFactory.i18nT('PLEASE_SELECT_JOB'));
          return;
        }
        var from = $rootScope.jobList_fromState;
        
        $state.go(from);
        $ionicViewSwitcher.nextDirection("back");
    }

    $scope.jobListArr = localStorageService.get('jobItems');

    var localProjectID = localStorageService.get('projectID');

    $scope.jobModel = {"jobList":localProjectID};
   
    function showConfirm(){
      helpToolsFactory.showConfirm( helpToolsFactory.i18nT('CONFIRM_TOGGLE_PROJECT'),
                                      helpToolsFactory.i18nT('CONFIRM_TOGGLE_PROJECT_CONTENT'),
                                      sureCb,
                                      cancelCb);
        function cancelCb(){
            var back = $rootScope.jobList_fromState;
            $state.go(back);
            $ionicViewSwitcher.nextDirection("back"); 
        }
        function sureCb(){

          return;
        }
    }

    if(localStorageService.get('isFillNewAct') === true){
      showConfirm();
    }
    
    $scope.$watch("jobModel.jobList", function(newVal,oldVal){
        
        if(newVal==oldVal){
          return;
        }


        $scope.jobModel.jobList = newVal;
        localStorageService.set('jobList', newVal);

        var selectProject =  $scope.jobListArr.filter(function(item, index, arr){
          return(item.ProjectID === newVal);
        });
        $rootScope.$broadcast('jobNumberSelect',selectProject[0].ProjectNo);
        localStorageService.set('projectID',newVal);
        $rootScope.$broadcast('projectid_changed', selectProject[0].ProjectID);
        localStorageService.set('projectNo',selectProject[0].ProjectNo);
        var StaffID = "";
        $scope.jobListArr.forEach(function(item, index, arr){
            if(item.ProjectID === newVal){
              StaffID = item.StaffID;
            }
        });

        localStorageService.set('staffID',StaffID);
        //var back = $ionicHistory.backView().stateName;
        var back = $rootScope.jobList_fromState;
        $state.go(back);
        $ionicViewSwitcher.nextDirection("back"); 
    });
})
.controller('PhotoResolutionCtrl', function($rootScope, $scope,localStorageService,$state,$ionicViewSwitcher, $ionicHistory){
    var localPhotoReso = localStorageService.get('photoReso') || "Original Size";
    $scope.photoRModel = {"photoReso":localPhotoReso};
    $scope.$watch('photoRModel.photoReso', function(newVal, oldVal){
      //console.log(oldVal);
      console.log(newVal);
      if(newVal === oldVal){
        return;
      }
      $state.go('tab.system');
      if(newVal === "原圖"){
        localStorageService.set('photoReso', "Original Size");
        $rootScope.$broadcast('photoResoChange', "Original Size");
      }else{
        localStorageService.set('photoReso', newVal);
        $rootScope.$broadcast('photoResoChange', newVal);
      }

      $scope.photoRModel.photoReso = newVal === "原圖"?"Original Size": newVal;
      $ionicViewSwitcher.nextDirection("back"); 
    });
})
.controller('FloorCtrl', function($rootScope, $scope, localStorageService, $state, $ionicViewSwitcher, helpToolsFactory, $timeout){

    /*var floorItems = localStorageService.get('floorItems');
    var floorNameArr = [];
    floorItems.forEach(function(item, index, arr){
      floorNameArr.push(item.AreaName);
    });
    $scope.floorParent.floorItems = helpToolsFactory.arrayUnique(floorNameArr);*/

    var localFloor = localStorageService.get('floorSelected');
    $scope.floorParent = {
      "floorModel":localFloor,
      "floorItems":[],
    }
    $rootScope.$on('blockSelected',function(d,data){
      var floorNameArr = [];
      data.forEach(function(item, index, arr){
        floorNameArr.push(item.AreaName);
      });

      $scope.floorParent.floorItems = helpToolsFactory.arrayUnique(floorNameArr);
    });

    //$scope.floorModel = ''; 
    
    
    $scope.$watch('floorParent.floorModel', function(newVal,oldVal){
        
        if(newVal === oldVal){
          return;
        }
        
        floorItems = localStorageService.get('floorItems');
        var selItems = floorItems.filter(function(item, index, arr){
          return (item.AreaName ===newVal)
        });

        $rootScope.$broadcast('floorChange', selItems);
        localStorageService.set('floorSelected',selItems);
        $state.go('tab.newAct');
        $ionicViewSwitcher.nextDirection("back");

    });
})
.controller('BlockCtrl', function($rootScope,$scope,localStorageService,$state, $ionicViewSwitcher, $timeout){
    $rootScope.$on('projectid_changed', function(event, data)
    {
        var newBlockSelection = [];
        var newProjectID = data;
        var locationList = localStorageService.get('downlistData')["LU_Location"];
        if (locationList != null)
        {
          for(var counter = 0; counter < locationList.length ; counter++)
          {
              if (locationList[counter].ProjectID == newProjectID)
              {
                  newBlockSelection.push(locationList[counter]);
              }
          }
        }
        $scope.blockItems = newBlockSelection;
    });

    $scope.blockItems = localStorageService.get('blockItems');

    $scope.getFloor = function(block){
        var locations = $scope.blockItems,
            i,
            len = locations.length,
            areaArr = [];
        
        for(i=0; i<len; i++){
           if(locations[i].ZoneName === block){
              var tempLocationData = {};
              if (locations[i].AreaName != null)
              {
                tempLocationData.AreaName = locations[i].AreaName.trim();
                tempLocationData.locationID = locations[i].LocationID;
              }else{
                tempLocationData.AreaName = "";
                tempLocationData.locationID = locations[i].LocationID;
              }

              areaArr.push(tempLocationData);
          }
        }
        
        localStorageService.set('floorItems',areaArr);
        localStorageService.set('blockSelected',block);
        

        /*if (areaArr.length === 1 && areaArr[0].AreaName === null) {  // Zone 没有 Area
          $rootScope.$broadcast('floorChange', areaArr);
          $rootScope.$broadcast('blockSelected',areaArr);
          $state.go('tab.newAct');
          $ionicViewSwitcher.nextDirection("back");

        } else*/ 
        if(areaArr.length === 1 && areaArr[0].AreaName === ""){

          $rootScope.$broadcast('floorChange',{"onlyBlockSelect":true,
                                                "locationID":areaArr[0].locationID});
          $state.go('tab.newAct');
          $ionicViewSwitcher.nextDirection("back");
        }else {
          $timeout(function(){
            $rootScope.$broadcast('blockSelected',areaArr);
            
          },100);
          $state.go('floor');
          $ionicViewSwitcher.nextDirection("forward");
        }
    }
    
})

.controller('CategoryCtrl', function($rootScope,$scope, categoryFactory, localStorageService, $state, $ionicViewSwitcher){
    
    $scope.category = localStorageService.get('categoryID')|| "";
    $scope.categoryItems = localStorageService.get('categoryItems');
    $scope.$watch('category', function(newVal, oldVal){
    
    // console.log('oldVal:'+oldVal);
    if(newVal==oldVal){
      return;
    }

    var textVal ='';
    var i=0, len = $scope.categoryItems.length;
    for(var i=0; i<len; i++ ){
      if($scope.categoryItems[i].CategoryID === newVal){
        textVal = $scope.categoryItems[i].name;
        break;
      }
    } 
    
    $rootScope.$broadcast('categoryChange',{
      categoryData:textVal,
      categoryID:newVal,

    });
    $state.go('tab.newAct');
    $ionicViewSwitcher.nextDirection("back");
    
  });
})

.controller('ReviewCtrl', function($rootScope,$scope, localStorageService, $state, $ionicViewSwitcher){

    var reviewItems = localStorageService.get('reviewItems');
    

    /*for(var i=0, len=reviewItems.length; i<len; i++){
        if(reviewItems[i].checked){
          return;
        }
        reviewItems[i].checked = "";
    }*/
     $scope.reviewList = reviewItems;
    // [{text:'Alan', checked:false}]
    
    $scope.backFromReview = function(){
      $scope.reviewList = localStorageService.get('reviewItems');
    }
    $scope.reviewDone = function(){
      
      var reviewData = [],
          reviewID = [];
      var arr = $scope.reviewList;
      for(var i=0, len=arr.length; i<len; i++){
        if(arr[i].checked){
          reviewData.push(arr[i].Name);
          reviewID.push(arr[i].StaffID);
        } else continue;
      }
      //console.log('reviewData:'+reviewData.join(','));
      //console.log('reviewID:'+reviewID.join(','));
      localStorageService.set('reviewItems', $scope.reviewList);
      if(reviewData.length >0 ){
        $rootScope.$broadcast('reviewDone',{
          "reviewData":reviewData.join(','),
          "reviewID":reviewID.join(','),
        });
      }else{
        $rootScope.$broadcast('reviewDone',{
          "reviewData":"",
          "reviewID":"",
        });
      }
      $state.go('tab.newAct');
      $ionicViewSwitcher.nextDirection("back");
  }
})
.controller('TradeCtrl', function($rootScope,$scope,$state, $ionicViewSwitcher, localStorageService){
  
  // $scope.category = 'Category A';
  $scope.trade = "Select Trade";
  //$scope.tradeList = [];

  var tradeItems = localStorageService.get('tradeItems');
  
  $scope.tradeList = tradeItems;

  $scope.backFromTrade = function(){
     $scope.tradeList = localStorageService.get('tradeItems');
  }
  $scope.tradeDone = function(){
      
      var tradeData = [];
      var tradeID = [];
      var arr = $scope.tradeList;
      for(var i=0, len=arr.length; i<len; i++){
        if(arr[i].checked){
          tradeData.push(arr[i].langName);
          tradeID.push(arr[i].TradeID);
        } else continue;
      }
      localStorageService.set('tradeItems', $scope.tradeList);
      if ( tradeData.length>0){
        $rootScope.$broadcast('tradeDone',{
          "tradeData":tradeData.join(','),
          "tradeID":tradeID.join(','),
        });
      }else{
        $rootScope.$broadcast('tradeDone',{
          "tradeData":"",
          "tradeID":"",
        });
      }
      $state.go('tab.newAct');
      $ionicViewSwitcher.nextDirection("back");


  }
})
.controller('CompanyCtrl', function($rootScope,$scope,$state, $ionicViewSwitcher,localStorageService){
 
  // $scope.category = 'Category A';
  $scope.company = "Select Subcontractor";
  var companyItems = localStorageService.get('companyItems');
  /*for(var i=0, len=companyItems.length; i<len; i++ ){
    companyItems[i].checked =false;
  }*/
  $scope.companyList = companyItems;
  /*var mock = [
    {text:'trade1', checked:false},
    {text:'trade2', checked:false},
    {text:'trade3', checked:false}
  ];*/
  $scope.backFromCompany = function(){
      $scope.companyList = localStorageService.get('companyItems');
  }
  $scope.companyDone = function(){
      
      var companyData = [];
      var companyID = [];
      var arr = $scope.companyList;
      for(var i=0, len=arr.length; i<len; i++){
        if(arr[i].checked){
          companyData.push(arr[i].langName);
          companyID.push(arr[i].CompanyID);
        } else continue;
      }
      localStorageService.set('companyItems',$scope.companyList);
      if(companyData.length>0){
        $rootScope.$broadcast('companyDone',{
          companyData:companyData.join(','),
          companyID:companyID.join(','),
        });
      }else{
        $rootScope.$broadcast('companyDone',{
          "companyData":"",
          "companyID":"",
        });
      }
      
      $state.go('tab.newAct');
      $ionicViewSwitcher.nextDirection("back");


  }
});

