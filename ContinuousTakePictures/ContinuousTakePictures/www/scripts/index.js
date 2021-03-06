﻿/// <reference path="jquery.js" />
// 有关“空白”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkID=397704
// 若要在 Ripple 或 Android 设备/仿真程序中调试代码: 启用你的应用程序，设置断点，
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

        takePicture();
        $("body")
            .on("touchend", "#images div", function (e) {
                e.preventDefault();
                $("#bigImage").attr("src", $(this).data("src"));
                $("#bigImage").show();
            })
            .on("click", "#takePicture", function (e) {
                e.preventDefault();
                takePicture();
            })
            .on("touchend", "#bigImage", function (e) {
                e.preventDefault();
                $(this).hide();
            });

    };
    function takePicture() {
        var options = {
            dir: "0tmp"
        };
        options.coverTpls = window.localStorage.getItem("coverTpls");
        options.isDrawing = JSON.parse(window.localStorage.getItem("drawingStatus") || false);
        options.isNeedRecord = JSON.parse(window.localStorage.getItem("needRecordStatus") || false);

        cordova.plugins.ContinuousTakePictures.takePictures(function (res) {
            if (!res) return;
            
            console.log(JSON.stringify(res))
            if (res.type == "TakePicture") {
                //needRecord
                //rects
                var tsrc = res.imagePath;
                tsrc = tsrc.substring(0, tsrc.length - 4);
                $("#images :first-child").before("<div data-src=\"" + (tsrc + "_z.jpg") + "\" style=\"background-image:url('" + (tsrc + "_t.jpg") + "')\"></div>")
            } else if (res.type == "Cover") {
                window.localStorage.setItem("coverTpls", JSON.stringify(res.tpls))
            } else if (res.type == "DrawingStatus") {
                window.localStorage.setItem("drawingStatus", JSON.stringify(res.status))
            } else if (res.type == "NeedRecordStatus") {
                window.localStorage.setItem("needRecordStatus", JSON.stringify(res.status))
            }

        }, function (e) {
            console.log(JSON.stringify(e));
        }, options);
    }
    function onPause() {
        // TODO: 此应用程序已挂起。在此处保存应用程序状态。
    };

    function onResume() {
        // TODO: 此应用程序已重新激活。在此处还原应用程序状态。
    };
})();
