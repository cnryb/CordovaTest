/// <reference path="jquery/dist/jquery.js" />
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
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
    };

    function onPause() {
        // TODO: 此应用程序已挂起。在此处保存应用程序状态。
    };

    function onResume() {
        // TODO: 此应用程序已重新激活。在此处还原应用程序状态。
    };
})();

function rotate() {
    var angle = getAngle(".app");
    angle += 90;
    angle %= 360;
    $(".app").css("transform", "rotate(" + angle + "deg)");
}



function getAngle(selector) {
    var angle = 0;
    var val = $(selector).css("transform");
    if (val != "none")
        angle = eval('get' + val);//构造getmatrix函数,返回上次旋转度数  

    return angle;
}

/* 
    * 解析matrix矩阵，0°-360°，返回旋转角度 
    * 当a=b||-a=b,0<=deg<=180 
    * 当-a+b=180,180<=deg<=270 
    * 当a+b=180,270<=deg<=360 
    * 
    * 当0<=deg<=180,deg=d; 
    * 当180<deg<=270,deg=180+c; 
    * 当270<deg<=360,deg=360-(c||d); 
    * */
function getmatrix(a, b, c, d, e, f) {
    var aa = Math.round(180 * Math.asin(a) / Math.PI);
    var bb = Math.round(180 * Math.acos(b) / Math.PI);
    var cc = Math.round(180 * Math.asin(c) / Math.PI);
    var dd = Math.round(180 * Math.acos(d) / Math.PI);
    var deg = 0;
    if (aa == bb || -aa == bb) {
        deg = dd;
    } else if (-aa + bb == 180) {
        deg = 180 + cc;
    } else if (aa + bb == 180) {
        deg = 360 - cc || 360 - dd;
    }
    return deg >= 360 ? 0 : deg;
}