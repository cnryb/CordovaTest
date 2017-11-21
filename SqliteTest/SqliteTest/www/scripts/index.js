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

        $("#startTest").click(function (e) {
            //var db = window.sqlitePlugin.openDatabase({ name: 'demo.db', location: 'default' });
            $("#msg").prepend(`<div> 开始测试</div>`);
            $("#msg").prepend(`<div></div>`);

            test();


        });


        var times = 10;
        var tt = [];

        function test() {
            var start = 0, end = 1000;
            var startTime = new Date().getTime();
            var t = {};

            mediPM.database.init().then(function () {
                return mediPM.database.clearDb();
            }).then(function () {
                startTime = new Date().getTime();

                var qs = [];
                for (var i = 0; i < end; i++) {
                    qs.push(mediPM.database.executeNonQuery('INSERT INTO Demo VALUES (?,?)', [i, i]));
                }
                return $.when(...qs);
            }).then(function () {
                t.insert = new Date().getTime() - startTime;
                $("#msg").prepend(`<div> 写入${end - start}条数据，用时 ${t.insert} 毫秒</div>`);
                startTime = new Date().getTime();
                return mediPM.database.executeQuery("SELECT * FROM Demo WHERE id = ?", [end / 2]);
            }).then(function (rows) {
                t.select = new Date().getTime() - startTime;
                console.log(rows);
                $("#msg").prepend(`<div> 随机查询一条数据用时 ${t.select} 毫秒</div>`);
                tt.push(t);
                times--;
                if (times > 0) {
                    test();
                } else {
                    var ttt = {};
                    ttt.insert = 0;
                    ttt.select = 0;
                    for (var i = 0; i < tt.length; i++) {
                        ttt.insert += tt[i].insert;
                        ttt.select += tt[i].select;
                    }

                    ttt.insert = ttt.insert / tt.length;
                    ttt.select = ttt.select / tt.length;

                    $("#msg").prepend(`<div> 平均写入${end - start}条数据，用时 ${ttt.insert} 毫秒</div>`);
                    $("#msg").prepend(`<div> 平均随机查询一条数据用时 ${ttt.select} 毫秒</div>`);
                }

            }).fail(function (err) {
                console.log(err);
            });
        }
    };


    function onPause() {
        // TODO: 此应用程序已挂起。在此处保存应用程序状态。
    };

    function onResume() {
        // TODO: 此应用程序已重新激活。在此处还原应用程序状态。
    };
})();



function rnd(n, m) {
    var random = Math.floor(Math.random() * (m - n + 1) + n);
    return random;
}