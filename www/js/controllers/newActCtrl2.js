'use strict';
(function () {
	angular.module('NewActCtrl', ['LocalStorageModule', 'ngStorage'])
		.controller('NewActCtrl', ['$rootScope', '$scope', '$window', '$timeout','localStorageService','$cordovaCamera','newActFactory','$translateLocalStorage', '$cordovaNetwork','dbFactory', 'uploadFactory','$state','$ionicViewSwitcher','$ionicPopup','$q', '$http', 'PARAMS','$cordovaFileTransfer','chkTokenFactory','$localStorage','helpToolsFactory',
							         function($rootScope, $scope, $window, $timeout,localStorageService,$cordovaCamera,newActFactory, $translateLocalStorage, $cordovaNetwork,dbFactory,uploadFactory,$state,$ionicViewSwitcher,$ionicPopup,$q, $http, PARAMS, $cordovaFileTransfer,chkTokenFactory,$localStorage,helpToolsFactory){
	
	  $scope.isTradeShow = false;
    $scope.reviewModel = {"isReviewShow":false};
    $scope.attachImgs = [];
    $scope.isGray_location = true;
    $scope.isGray_category = true;
    $scope.isGray_review = true;
    $scope.isGray_trade = true;
    $scope.isGray_company = true;
    $scope.isGray_mockinput = true;

    // 获取APP Version
    /*var chkAppVersion = function(){
      var version = "";
      document.addEventListener("deviceready", onDeviceReady, false);
      function onDeviceReady() {
        if (window.cordova){
            cordova.getAppVersion.getVersionNumber().then(function (version) {
               version = version;
            });
        }
      }
      var chkAppVersionReq = {
        version:version
      }
    };
    chkAppVersion();
    // TODO: 判断App是否需要强制升级？如果需要强制升级，就推出App
    */

    // 获取下拉菜单的数据
    function getDownlist (){
      
      var token = localStorageService.get('token');
      var username = localStorageService.get('username');
      
      chkTokenFactory.refreshToken(token)
        .then(function(result){
          if(result.statusText ==="OK"){
            // Token expires and get refreshed token
            token = result.data;
            localStorageService.set('token',result.data);
          }/*else if(result==='false'){
            // Token not expire
          
            return;
          }*/
          
          var getDownlistReq = {
            token:token,
            username:username,
          }
          
          var getDownlistReqStr = '"'+JSON.stringify(getDownlistReq).replace(/\"/g,"\'")+'"';

          // loading弹窗 
          newActFactory.getDownlist(getDownlistReqStr)
            .then(function(result){
                //var jsonRes = JSON.parse(result.data);
                //console.log(jsonRes);
              
                if(result.data && result.data.success==="true"){
                    // console.log('downlistData:');
                    console.log(result.data);
                    //console.log(result.data.LU_Company[0].CompanyID);
                    var resObj = result.data;

                    //拿到的json，值为数值的话转成字符串
                    for(var i in resObj){
                        if(Array.isArray(resObj[i])===true){
                            resObj[i].forEach(function(item, index, arr){
                            for(var j in item){
                                if(typeof item[j] === "number"){
                                item[j] = item[j]+"";
                                }
                            }
                            });
                        }
                      
                    }
                    console.log(typeof 123);
                    console.log(resObj);
                    localStorageService.set('downlistData', resObj);
                    getJobList();
                    getTasklist();
                    selectProject();
                    doUpload();
                }else if(result.data && result.data.success==="false" && result.data.error ==="Token Invalid"){
                // token invalid情况
                    helpToolsFactory.tokenInvalidHandler();
                }else{
                    if(localStorageService.get('downlistData')){
                        return;
                    }
                    console.log('加载错误，请重试');
                    helpToolsFactory.tokenInvalidHandler();
                }
            });
        });
    }

    // 获取jobList下拉菜单
    function getJobList(){
      var staffProjectArr = localStorageService.get('Project#Staff');
      var LU_Project = localStorageService.get('downlistData').LU_Project;

      var LU_ProjectFilter = [];
      /* LU_ProjectFilter 格式：
      [{
          ProjectID:"1",
          ProjectNO:"1",
          ProjectName:"ProjectName1",
          StaffID:"111",
      }] */
      // 筛选LU_Project，条件是ProjectID等于Project#Staff中的Project
      staffProjectArr.forEach(function(item, index, arr){
        
          LU_Project.forEach(function(itemPro, index, arr){
              if(itemPro.ProjectID === item.split("#")[0]){
                  itemPro.StaffID = item.split("#")[1];
                  LU_ProjectFilter.push(itemPro);
              }
          });

      });
      console.log(LU_ProjectFilter);
      localStorageService.set('jobItems',LU_ProjectFilter);
    }

    // 获取Task List的数据
    function getTasklist (){
      
      var token = localStorageService.get('token');
      var getTasklistReq = {
        token:token
      }

      newActFactory.getTasklist(getTasklistReq)
        .then(function(result){
            if(result.success){
              
              localStorageService.set('tasklistData', result.data);
              localStorageService.set('badgeTask',result.data.length);
              $rootScope.$broadcast('updateBadgeTask',result.data.length);
            }
        })
    } 

    // 监听登录成功的事件
    $rootScope.$on('loginSuccess', function(){
      getDownlist();

    });

    // 或者，之前已经登录过，重新打开App，但Token还有效时，尝试更新数据
    function refreshData(){
      if (isNeedToRefreshData === 'Y') {   // TODO: 还需要判断是否网络
        getDownlist();

        isNeedToRefreshData === 'N';
      }
    }
    refreshData();


    // 如果没有选择Project引导用户先选Project
    function selectProject(){
      var projectID = localStorageService.get('projectID');

      if (projectID === null) {
           $state.go('jobList');
           $ionicViewSwitcher.nextDirection("forward");
      }
    }

    $scope.toggleTradeShow = function(){
      $scope.isTradeShow = !$scope.isTradeShow;
    }

    // 获取地址下拉菜单,需要根据ProjectID筛选
    $scope.getLocationBlock = function(){
      var locations = localStorageService.get('downlistData').LU_Location;
      var projectID = localStorageService.get('projectID');
      var blockItems = [],
          i,
          len = locations.length;

      for(i=0; i<len; i++){
       
        if(locations[i].ProjectID === projectID){
          blockItems.push(locations[i]);
        }
      }
      
      localStorageService.set('blockItems', blockItems);
      $timeout(function(){
        $state.go('block');  
        $ionicViewSwitcher.nextDirection("forward");  
      },100);
      
    }

    // 获取Category下拉菜单
    $scope.getCategory = function(){
      var categoryItems = localStorageService.get('downlistData').LU_Category;
      var lang = $translateLocalStorage.get('NG_TRANSLATE_LANG_KEY');
      //localStorageService.set('categoryItems', categoryItems);
      
      var i=0,
          len = categoryItems.length;
      for(i; i<len; i++){
          //categoryItems[i].name = "";
          if(lang === "us_en"){
            categoryItems[i].name = categoryItems[i].CategoryName;
          } else {
            categoryItems[i].name = categoryItems[i].CategoryChineseName;
          }
      }
      localStorageService.set('categoryItems', categoryItems);

      $timeout(function() {
        $state.go('category');  
        $ionicViewSwitcher.nextDirection("forward");  
      }, 100);
    }

    /**
     * 取得多选输入框的下拉菜单
     * @param  {string}  selectName       
     * @param  {Boolean} isFilterByProject [是否按ProjectID分组]
     * @param  {Boolean} isUseLang [是否分中英文]
     */
    $scope.getMulti = function(selectName, isFilterByProject, isUseLang){

      // 第一个字母大写
      var upperSelectName = selectName.substr(0,1).toUpperCase() + selectName.substr(1,selectName.length-1);
      var itemList = null;
      
      if(localStorageService.get(selectName+'Items')){
          itemList = localStorageService.get(selectName+'Items');
      }else if(localStorageService.get(selectName+'Items') === null){
        itemList = localStorageService.get('downlistData')['LU_'+upperSelectName];
        if(selectName === 'review'){
            itemList = localStorageService.get('downlistData').tbl_UserProfile;
        }
        filterByProjectID();
      }          
      
      function filterByProjectID(){
        //是否按ProjectID分组
        if(isFilterByProject && isFilterByProject===true){
            itemList = itemList.filter(function(item, index, arr){
              return (item.ProjectID === localStorageService.get('projectID') );
            });

            //是否分中英文
            if(isUseLang && isUseLang === true){
              var langKey = $translateLocalStorage.get('NG_TRANSLATE_LANG_KEY');
              
              itemList.forEach(function(item, index, arr){
                if(langKey === 'us_en'){
                  item.langName = item[upperSelectName+'Name'];
                } else if(langKey === "zh_hk"){
                  item.langName = item[upperSelectName+'ChineseName'];
                }
                
              });
            }
        }
      }
      
      localStorageService.set(selectName+'Items', itemList);
      $state.go(selectName);  
      $ionicViewSwitcher.nextDirection("forward");  
    }
    


    $scope.locationOn = false;    //是否选择
    $scope.categoryOn = false;    //是否选择

    // floor.html页面单选后跳回来
    $scope.floor = 'A';
    
    if(localStorageService.get('location') ){
      $scope.location =  localStorageService.get('location');
      $scope.locationID =  localStorageService.get('locationID');
      $scope.locationOn = true;
      localStorageService.set('isFillNewAct',true);
    } else {
      $scope.location = helpToolsFactory.i18nT('SELECT_LOCATION');
    }
    

    $rootScope.$on('floorChange', function(d, data){
      var block = localStorageService.get('blockSelected');
      var locationStr;
      if(data.onlyBlockSelect &&  data.onlyBlockSelect===true){
        locationStr = block;
        $scope.locationID = data.locationID;
      } else {
        locationStr = block + (data[0].AreaName === null ? "" : (" / " + data[0].AreaName));
        $scope.locationID = data[0].locationID;
      }
      
      $scope.isGray_location = false;
      $scope.location = locationStr;
      
      $scope.locationOn = true;
      localStorageService.set('isFillNewAct',true);
      localStorageService.set('location', locationStr);
      localStorageService.set('locationID', $scope.locationID);
    });

    // 切換了projectID就要清空页面 
    $rootScope.$on('jobNumberSelect', function(){
      // 如果在newAct页面填过内容
      
      if(localStorageService.get("isFillNewAct") === true){
        clearNewAct();
        $scope.location = helpToolsFactory.i18nT('SELECT_LOCATION');
        $scope.locationOn = false;
        $scope.isGray_location = true;
      }
      
    });

    /*
     * [onSelect 监听选项改变]
     * @param  {string}  selectName [选项名]
     * @param  {Boolean} isMulti    [是否为多选]
     * @author Mary Tien
     */
    
    $scope.reviewOn = false;
    $scope.tradeOn = false;
    $scope.companyOn = false;
    $scope.tradeNum = 0;
    $scope.companyNum =0;
    var onSelect = function(selectName, isMulti){
        $scope[selectName] = 'Select ' + selectName.substring(0,1).toUpperCase()+selectName.substring(1);
        if(selectName === 'review')
        {
          $scope[selectName] = 'Select User';
        }
        if(selectName ==="category"){
          if(localStorageService.get('category')){
            $scope.category =  localStorageService.get('category');
            $scope.categoryID =  localStorageService.get('categoryID');
            $scope.categoryOn = true;
            localStorageService.set('isFillNewAct',true);
          } else {
            $scope.category = helpToolsFactory.i18nT('SELECT_CATEGORY');
          }
        }
        
        if(isMulti){
            $rootScope.$on(selectName + 'Done', function(d, data){
              if(d.name==="tradeDone")
              {
                var tradeNum = data.tradeID.split(',').length;
                $scope.tradeNum = tradeNum;
              }
              else if(d.name==="companyDone"){
                var companyNum = data.companyID.split(',').length;
                $scope.companyNum = companyNum;
              }

                $scope['is'+selectName+'Show'] = true;
                $scope['isGray_'+ selectName] = false;
                $scope[selectName] = data[selectName+'Data'];
                $scope[selectName + 'ID'] = data[selectName+'ID'];
                if(data[selectName+'Data'] === ""){
                  $scope[selectName + 'On'] = false;
                }else{
                  $scope[selectName + 'On'] = true;  //是否选择
                }
                
                localStorageService.set('isFillNewAct',true);
            });
            return;
        }
        $rootScope.$on(selectName + 'Change', function(d, data){
            $scope['isGray_'+ selectName] = false;
            $scope[selectName] = data[selectName+'Data'];
            $scope[selectName + 'ID'] = data[selectName+'ID'];
            //console.log(data);
            if(selectName === 'category'){
              localStorageService.set('category', data.categoryData);
              localStorageService.set('categoryID', data.categoryID);
            }
            $scope[selectName + 'On'] = true;  //是否选择
            localStorageService.set('isFillNewAct',true);
        });
    }

    
    onSelect('review', true);
    onSelect('trade', true);
    onSelect('category', false);
    onSelect('company', true);

    $scope.clear = function(clearName){
       $scope['isGray_'+clearName] = true;
       var upperClearName = clearName.charAt(0).toUpperCase() + clearName.slice(1);
       $scope[clearName] = 'Select '+upperClearName;
       if(clearName==="trade"){
        $scope.tradeNum = 0;
       }
       else if(clearName==="company"){
        $scope.companyNum = 0;
       }
    }
   

    /*
     * 当切换语言时，改变各个输入框的默认提示内容
     * @author Mary
     */
    
    $scope.mockInputData = helpToolsFactory.i18nT('INPUT_LOG_HERE');

    $rootScope.$on('changeLanguage', function(e, lang){
      $scope.mockInputData = helpToolsFactory.i18nT('INPUT_LOG_HERE');
      $scope.review = helpToolsFactory.i18nT('SELECT_USER');
      if(!localStorageService.get('location')){
        $scope.location = helpToolsFactory.i18nT('SELECT_LOCATION');
      }

      if(!localStorageService.get('category')){
        $scope.category = helpToolsFactory.i18nT('SELECT_CATEGORY');
      }
    });
    

    /*
     * 从图库选添加照片&&拍照
     * @author Mary
     */
    
        

    $scope.photoLength = 0;
    //拍照
    $scope.takePhoto = function(){
      //var options = _setOptions(navigator.camera.PictureSourceType.CAMERA);
      // 注意：这个options必须写在这里，不能为了避免与$scope.getPhoto中的options重复代码，
      // 定义setOptions函数返回options，在这里调用，否则在手机上测试会有bug
        var options = {
            // Some common settings are 20, 50, and 100
            quality: 100,
            destinationType: navigator.camera.DestinationType.FILE_URI,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: navigator.camera.PictureSourceType.CAMERA,
            encodingType: navigator.camera.EncodingType.JPEG,
            mediaType: navigator.camera.MediaType.PICTURE,
            allowEdit: false,
            saveToPhotoAlbum:true,
            correctOrientation: true  //Corrects Android orientation quirks
        }
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
             
              $cordovaCamera.getPicture(options).then(function(imgURI) {
                //$scope.imgURI = imgURI;
                $scope.attachImgs.unshift({
                    'imgURI':imgURI,
                    isShowSelectIcon:false,
                });
                localStorageService.set('isFillNewAct',true);
                localStorageService.set('photoList', $scope.attachImgs);
                $scope.photoLength ++;

              }, function(err) {
                console.debug("Unable to obtain picture: " + err, "app");
              });

              /*$cordovaCamera.cleanup().then(function(){
                console.log('cleanup success');
              },function(){
                console.log('cleanup err');
              });*/
          }
    }

    //新增图片
    $scope.getPhoto = function(){
	
		var invokeGetPicture = function()
		{
			document.addEventListener("deviceready", onCanGetPicture, false);
			function onCanGetPicture()
			{
				window.imagePicker.getPictures(
					function(results)
					{
						for (var i = 0; i < results.length; i++) {
							console.log('Image URI: ' + results[i]);
							$scope.attachImgs.unshift( {'imgURI':results[i]} );
						}
						localStorageService.set('isFillNewAct',true);
						localStorageService.set('photoList', $scope.attachImgs);
						$scope.photoLength = $scope.photoLength + results.length;
						
						if(!$scope.$$phase) {
							$scope.$apply();
						}
					},
					function (error)
					{
						console.log('Unable to obtain pictures: ' + error);
					}
				);
			}
		};
		var writePermitErrorCallback = function()
		{
			console.log("Request permission error");
		};
		var permissions = cordova.plugins.permissions;
		
		console.log("Request for write permission");
		permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE,
			function(status)//call back
			{
				if (!status.hasPermission)
				{
					console.log("No write permission > prompt to grant the permission");
					permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE,
						function(status_req)
						{
							if (status_req.hasPermission)
							{
								console.log("Write permission granted");
								invokeGetPicture();
							}
							else
							{
								console.log("Write permission denied");
							}
						},
						writePermitErrorCallback
					);
				}
				else
				{
					console.log("Write permission is granted");
					invokeGetPicture();
				}
			},
			writePermitErrorCallback
		);
			
    }
    
    // 点击图片放大
    $scope.bigImage = false;
    $scope.showBigImg = function(imgUri){
      console.log(imgUri);
      $scope.bigImgUrl = imgUri;
      $scope.bigImage = true;
    }
    $scope.hideBigImg = function(){
      
      $scope.bigImage = false;
    }

    // 点击红叉删除图片
    $scope.delPhoto = function(imgUri){
      
      var i, len =  $scope.attachImgs.length;
      
      for(i=0; i<len; i++){
        if($scope.attachImgs[i].imgURI === imgUri){
          $scope.attachImgs.splice(i,1);
          break;
        }
      }
      if($scope.attachImgs.length>0){
        localStorageService.set('isFillNewAct',true);
      }else{
        localStorageService.set('isFillNewAct',false);
      }

      $scope.photoLength--;
      
    }
    //删除图片后，刷新newAct页面的photoList
    $rootScope.$on('deletePhotoDone', function(d, data){
        $scope.attachImgs = data;
        $scope.photoLength = data.length;
        if($scope.attachImgs.length>0){
          localStorageService.set('isFillNewAct',true);
        }else{
          localStorageService.set('isFillNewAct',false);
        }
    });

    // log input clear content when focus
    $scope.isMockInputVal = false; // 是否填写
    $scope.mockInputFocus = function($event){
      console.log('onFocus');
        
      if ($scope.isMockInputVal === false) {
          $scope.mockInputData = "";
          document.getElementById("mockinput").innerHTML = "";
      }

      $scope.isGray_mockinput = false;
      // $event.target.focus();
      /*$event.target.click();*/
      //return true;
      var e = document.createEvent("MouseEvents");
      e.initEvent("click", true, true);
      document.getElementById("mockinput").dispatchEvent(e);
      document.getElementById("mockinput").click();
      //document.getElementById('realInput').onclick();
      // angular.element('#mockinput').trigger('click');
      //angular.element(document.getElementById("mockinput")).triggerHandler('click');
      
     // console.log($event);
    }
    $scope.mockInputBlur = function(){
      //var mockInputCont1 = document.getElementById("mockinput").innerHTML.replace(/(<[\/]?div>)|(<br>)|(&nbsp;)/g,"");
      //var mockInputCont2 = document.getElementById("mockinput").innerHTML.replace(/<.+?>/gim,'');
      var mockInputCont = document.getElementById("mockinput").innerText;
      //mockInputCont = mockInputCont.replace("\"","\\\"");                 // 对双引号转义

      if(mockInputCont){
          $scope.isMockInputVal = true;
          localStorageService.set('isFillNewAct',true);
          console.log('mockinputCont:'+mockInputCont);
          console.log('$scope.isMockInputVal:'+$scope.isMockInputVal);
          $scope.mockInputData = mockInputCont;
      }
    }

    
    var showTime = function(){
      var d = new Date();
      var date = (d.getFullYear()) + "/" + 
           (d.getMonth() + 1) + "/" +
           (d.getDate()) + " " + 
           (d.getHours()) + ":" + 
           (d.getMinutes());

      
      return date;
    }

    /**
     * 监听editItem
     */
    $rootScope.$on('editItem', function(d, data){
      
      //更新视图数据
      $scope.location = data.location;
      $scope.locationOn = true;
      $scope.category = data.category;
      $scope.categoryOn = true;
      
      $scope.review = data.review ||"";
      $scope.reviewModel.isReviewShow = $scope.reviewOn = data.review?true:false;

      $scope.trade = data.trade || "";
      $scope.tradeOn = data.trade?true:false;
      $scope.company = data.company || "";
      $scope.companyOn = data.company?true:false;
      
      document.getElementById('mockinput').innerHTML = data.description;
      $scope.mockInputData = data.description||"";
      $scope.isMockInputVal = data.description===""?false:true;
      //$scope.attachImgs = data.photos[0]===""?[]:data.photos;
      if(data.photos[0]===""){
        $scope.attachImgs = [];
      }else{
        data.photos.forEach(function(item, index, arr){
          $scope.attachImgs.push({
            'imgURI':item
          });
        });
      }
      
      $scope.createdOn = data.createdOn;
      
      $scope.ActivityId = data.ActivityId;
      
      var edit_idData = JSON.parse(data.idData);
      console.log(edit_idData);
      localStorageService.set('staffID', edit_idData.StaffID);
      localStorageService.set('projectID', edit_idData.ProjectID);
      $scope.locationID = edit_idData.LocationID;
      $scope.CategoryID = edit_idData.CategoryID;
      $scope.reviewID = edit_idData.NotityID;
      $scope.TradeID = edit_idData.TradeID;
      $scope.CompanyID = edit_idData.CompanyID;


    });
    // 保存数据
    
    // dbFactory.dropTbl('fe_Activity');
    
    $scope.saveAct = function(){
      // upload消息数
      var badgeUpload = localStorageService.get('badgeUpload')|| 0;
      
      // 点击保存按钮后要间隔100ms,为了等一些耗时操作的完成，例如localStorage存数据
      $timeout(function() {
          var confirmBy = $scope.locationOn && $scope.categoryOn && ( $scope.attachImgs.length>0 || $scope.isMockInputVal)
         
          if(confirmBy){
            console.log('saveAct confirmBy');
            
            var time = $scope.createdOn?$scope.createdOn:showTime(),
                review = ($scope.reviewModel.isReviewShow && $scope.reviewOn)? $scope.review:"",
                RequireReqview = ($scope.reviewModel.isReviewShow && $scope.reviewOn)?true:false,
                trade = $scope.tradeOn? $scope.trade:"",
                company = $scope.companyOn? $scope.company:"",
                staffID = localStorageService.get('staffID'),
                projectID = localStorageService.get('projectID'),
                log = $scope.isMockInputVal? $scope.mockInputData:"",
                idData,
                NotityID;
            /*var RequireReqview = false;
            if($scope.reviewID){
              RequireReqview = true;
            }  */
            if($scope.reviewModel.isReviewShow && $scope.reviewOn){
              NotityID = $scope.reviewID?$scope.reviewID:"undefined"
            }else{
              NotityID = "undefined";
            }
            idData = {

              "StaffID":staffID,
              "ProjectID":projectID,
              "LocationID":$scope.locationID,
              "CategoryID": $scope.categoryID,
              "RequireReqview":RequireReqview || false,
              "NotityID": NotityID,
              "TradeID": $scope.tradeID || "undefined",
              "CompanyID": $scope.companyID || "undefined",
              "Importance":"undefined",
              "Description":log,
              "GUID": helpToolsFactory.GUID(),
            };

            var ActivityId_fake = localStorageService.get('ActivityId_fake') || 0;
            var attPhotos = $scope.attachImgs;
            var photosArr = [];
            for(var m=0, phLen = attPhotos.length; m<phLen; m++ ){
                photosArr.push(attPhotos[m].imgURI);
            }             
            
            var fieldArr = [];
            var actData = {
              ActivityId:ActivityId_fake,
              projectId:projectID,
              location: $scope.location,
              category: $scope.category,
              review: review,
              trade: trade,
              company: company,
              photos: photosArr.join(',') || "",
              photoLength:$scope.attachImgs.length,
              photoIds:"",
              description: log,
              createdOn:time,
              idData:JSON.stringify(idData),
            }
            if(typeof $scope.ActivityId === 'number'){
              actData.ActivityId = $scope.ActivityId;
              //actData.idData = actData.idData.replace(/\"/g,"");
              dbFactory.update('fe_Activity',
                                actData,
                                {ActivityId:$scope.ActivityId},
                                function succeCb(){
                                  console.log('update success');
                                  $timeout(function() {
                                    $rootScope.$broadcast('saveAct');
                                  }, 100);
                                  $scope.ActivityId = "";
                                  helpToolsFactory.showMsg(helpToolsFactory.i18nT('SAVE_TO_PENDING_SUCCESS'));
                                  doUpload();
                                  clearNewAct();
                                  return;
                                },
                                function errorCb(){
                                  console.log('update error');
                                });
              return;
            }

            for(var i_fld in actData){
              fieldArr.push(i_fld);
            }

            // console.log('fieldArr:'+fieldArr);
            dbFactory.createTbl('fe_Activity',fieldArr);
            dbFactory.save('fe_Activity',actData);
            ActivityId_fake ++;
            localStorageService.set('ActivityId_fake',ActivityId_fake);
            
            badgeUpload ++;
            localStorageService.set('badgeUpload',badgeUpload);
            $rootScope.$broadcast('updateBadgeUpload',badgeUpload);
            $timeout(function() {
              $rootScope.$broadcast('saveAct');
            }, 100);
            helpToolsFactory.showMsg(helpToolsFactory.i18nT('SAVE_TO_PENDING_SUCCESS'));
            doUpload();
            // uploadFactory.coreUpload();
            clearNewAct();
          } else {
            helpToolsFactory.showAlert(helpToolsFactory.i18nT('MANDATORY_NOT_FILL'));
          }
      }, 100);     
      
    }

    
    // newAct页面清空
    var clearNewAct = function(){
        console.log('clearNewAct');
        
        $scope.photoLength = 0;

        $scope.isMockInputVal = false;
        $scope.mockInputData = helpToolsFactory.i18nT('INPUT_LOG_HERE');
        document.getElementById("mockinput").innerHTML = helpToolsFactory.i18nT('INPUT_LOG_HERE');
        $scope.review = helpToolsFactory.i18nT('SELECT_USER');
        $scope.reviewOn = false;
        $scope.tradeOn = false;
        $scope.companyOn = false;
        $scope.trade = helpToolsFactory.i18nT('SELECT_TRADE');
        $scope.company = helpToolsFactory.i18nT('SUBCONTRACTOR');
        $scope.createdOn = "";
        $scope.tradeNum = 0;
        $scope.companyNum = 0;

        $scope.isGray_review = true;
        $scope.isGray_trade = true;
        $scope.isGray_company = true;
        $scope.isGray_mockinput = true;
        $scope.attachImgs = [];
        localStorageService.set('photoList',$scope.attachImgs);
        localStorageService.set('reviewItems',null);
        localStorageService.set('tradeItems',null);
        localStorageService.set('companyItems',null);
        

    }
    

    // 开一个永远不关的定时器，后期优化再做按需开关定时器
    var timer = null;
    chkNetChange();
    // 根据网络情况调用上传
    doUpload();

    
    // 开定时器,每隔1s检测网络变化，只检测WIFI与3G/4G的转变            
    function chkNetChange(){
        document.addEventListener("deviceready",onDeviceReady, false);
        function onDeviceReady(){
            var type = $cordovaNetwork.getNetwork();
            var memType = type;
            coreChkNetChange();
            function coreChkNetChange(){
              
              timer = $timeout(function(){
                    
                    var oldType = memType;
                    var newType = $cordovaNetwork.getNetwork();
                    memType = newType;
                    
                    if(newType!==oldType){
                      $rootScope.$broadcast('netChange', { "newType":newType, "oldType":oldType });
                    }

                    // 把isStopChkNetChange设定为true就可以关闭这个定时器
                    // if(isStopChkNetChange===true){
                    //   return;
                    // };
                    coreChkNetChange();
              },1000);

              timer.then(function(){
                console.log( "Timer resolved!");
              },function(){
                console.log( "Timer rejected!");
              });
            }
          
        }
    }

    function doUpload(){
/*
测试用例：
1、WIFI
2、4G, not allow
3、4G, Allow

 */  // uploadFactory.coreUpload();
        document.addEventListener("deviceready",onDeviceReady, false);
        function onDeviceReady(){

            var type = $cordovaNetwork.getNetwork();
            var memType = type;
            

            var allow3G = localStorageService.get('allow3G') || false;
            console.log('getNetwork:'+ type);
            //console.log('getNetwork');
            var isOnline = $cordovaNetwork.isOnline();
            var isOffline = $cordovaNetwork.isOffline();

            
            if(isOnline ===true){
                //只要联网，就要开定时器检测网络变化
                //$timeout.cancel(timer);
                //chkNetChange();
                if(type===Connection.WIFI||(type===Connection.CELL_3G||type===Connection.CELL_4G) && allow3G===true){
                    console.log('online! start upload');
                    uploadFactory.coreUpload();
                } else {
                  //uploadFactory.stopUpload();
                }
              
                onNetChange();
                
            }

            // 监听allow3G的改变，此时只需检测3G/4G
            $rootScope.$on('allow3G_Change', function(d,data){
              localStorageService.set('allow3G',data);
              if(data === true){ 
                // Allow 3G，并且处于3G或4G的环境，就自动上传
                var type = $cordovaNetwork.getNetwork();
                if(type===Connection.CELL_3G || type===Connection.CELL_4G){
                  uploadFactory.coreUpload();
                }
                
              }else if(data === false){
                // not Allow 3G, 如果手机连接3G或4G，就要停止上传，并允许手动点击start upload上传
                if(type===Connection.CELL_3G || type===Connection.CELL_4G){
                  uploadFactory.stopUpload();
                }
              }

            });

            //设备联网事件
            //一连上网络，就检查是否满足自动上传的条件
            $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
              
                //只要联网，就要开定时器检测网络变化
                //$timeout.cancel(timer);
                //chkNetChange();

                console.log('device is online');
                var allow3G = localStorageService.get('allow3G') || false;

                if(networkState === Connection.WIFI){
                  uploadFactory.coreUpload();
                
                } else if((networkState === Connection.CELL_3G || networkState ===Connection.CELL_4G) && allow3G === true){
                  uploadFactory.coreUpload();
                  
                } else if((networkState === Connection.CELL_3G || networkState ===Connection.CELL_4G) && allow3G === false){
                  //uploadFactory.stopUpload();
                }
                onNetChange();

            });

            $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
              //关定时器，关闭上传，不允许点击start upload
              //$timeout.cancel(timer);
              uploadFactory.stopUpload();
            });

            //监听到连线网络类型发生变化时，进行相应判断和处理
            function onNetChange(){
                $rootScope.$on('netChange', function(d, data){
                    
                      if((data.oldType===Connection.CELL_3G ||  data.oldType===Connection.CELL_4G) && allow3G===false && data.newType===Connection.WIFI){
                        // 如果从3G/4G且not Allow3G，变成wifi，就开始上传
                        uploadFactory.coreUpload();
                        
                      } else if(data.oldType===Connection.WIFI && (data.newType===Connection.CELL_3G || data.newType===Connection.CELL_4G) && allow3G===false){
                        // 如果从wifi变成，3G/4G且not allow3G，就要停止上传
                        //uploadFactory.stopUpload();
                      }
                  });
            }
        }
    }

    
		}])
    .filter('zoneUnique', function() {                  // ng-repeat 过滤重复
       return function(collection, keyname) {
          var output = [], 
              keys = [];

          angular.forEach(collection, function(item) {
              var key = item[keyname];
              if(keys.indexOf(key) === -1) {
                  keys.push(key);
                  output.push(item);
              }
          });

          return output;
       };
    });

})();




