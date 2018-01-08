/// <reference path="../bower_components/jquery/dist/jquery.js" />
// 有关“空白”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkID=397704
// 若要在 cordova-simulate 或 Android 设备/仿真器上在页面加载时调试代码: 启动应用，设置断点，
// 然后在 JavaScript 控制台中运行 "window.location.reload()"。
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // 处理 Cordova 暂停并恢复事件
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        // TODO: Cordova 已加载。在此处执行任何需要 Cordova 的初始化。
        //var parentElement = document.getElementById('deviceready');
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');
        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        $("#registerPush").click(function (e) {
            window.g_account = {};
            g_account.userId = "test";
            registerPush();

        });
    };

    function onPause() {
        // TODO: 此应用程序已挂起。在此处保存应用程序状态。
    };

    function onResume() {
        // TODO: 此应用程序已重新激活。在此处还原应用程序状态。
    };


    function registerPush() {
        var deferred = $.Deferred();
        if (window.tinyHippos) {
            deferred.reject("Error: 在ripple中无法注册通知");
            return deferred.promise();
        }
        //if (navigator.connection.type === window.Connection.NONE) {
        //    deferred.reject("Error: 网络未连接");
        //    return deferred.promise();
        //}
        if (!g_account) {
            deferred.reject("Error: 未登录");
            return deferred.promise();
        }

        function callback(type, data) {
            console.log("callback_init");
            console.log(type);
            console.log(data);
            if (type == 'cid') {
                //TODO data = clientid

                //长度40字节，支持中、英文（区分大小写）、数字以及下划线 
                //测试的时候，别名中混进-短横线，接口返回数据true，但未绑定成功
                //个推的客服说放在这里比较合适
                GeTuiSdkPlugin.bindAlias(function (type, data) {
                    console.log(type);
                    console.log(data);
                }, 'android_' + g_account.userId);

            } else if (type == 'pid') {
                //TODO data = 进程pid
            } else if (type == 'payload') {
                //TODO data=透传数据
            } else if (type == 'online') {
                if (data == 'true') {
                    //TODO 已上线

                    

                } else {
                    //TODO 已离线
                }
            }
        };
        GeTuiSdkPlugin.callback_init(callback);
        GeTuiSdkPlugin.initialize();

        return deferred.promise();
    }


})();