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
    //$(".app").css("transform", "rotate(" + 90 + "deg)");
    var m = $(".app").css("transform");
    var angle = 0;
    if (m != "none") {
        var matrix = decomposeMatrix($(".app").css("transform"));
        angle = matrix.rotate;

        //if (angle == -90)
        //    angle = 270;
    }

    angle += 90;
    //angle %= 360;
    $(".app").css("transform", "rotate(" + angle + "deg)");
    //console.log(angle)
    //if (angle == 360) {
    //    var transition = $(".app").css("transition");
    //    $(".app").css("transition", "none");
    //    $(".app").css("transform", "rotate(0deg)");
    //    $(".app").css("transition", transition);
    //}
}




function toMatrixArray(matrix) {
    matrix = matrix.match(/matrix\((.+)\)/)[1];
    matrix = matrix.split(/,/);
    for (var v in matrix) {
        v = myParse(v);
    }
    return matrix;
}

function decomposeMatrix(matrix) {
    matrix = toMatrixArray(matrix);
    var scaleX, scaleY, skew,
        A = matrix[0],
        B = matrix[1],
        C = matrix[2],
        D = matrix[3];
    if (A * D - B * C) {
        scaleX = Math.sqrt(A * A + B * B);
        skew = (A * C + B * D) / (A * D - C * B);
        scaleY = (scaleX * (A * D - B * C)) / (A * A + B * B);
        // step (6)
        if (A * D < B * C) {
            skew = -skew;
            scaleX = -scaleX;
        }
    } else {
        scaleX = scaleY = skew = 0;
    }
    return {
        'translateX': myParse(matrix[4]),
        'translateY': myParse(matrix[5]),
        'rotate': myParse(Math.atan2(B, A) * 180 / Math.PI),
        'skewX': myParse(Math.atan(skew) * 180 / Math.PI),
        'skewY': 0,
        'scaleX': myParse(scaleX),
        'scaleY': myParse(scaleY)
    };
}

function defaultDecompose() {
    return {
        'translateX': 0,
        'translateY': 0,
        'rotate': 0,
        'skewX': 0,
        'skewY': 0,
        'scaleX': 1,
        'scaleY': 1
    };
}

function myParse(v) {
    return Math.round(parseFloat(v) * 1e5) / 1e5;
}

// turn transform string into standard matrix form
function matrix(transform) {
    transform = transform.split(')');
    var trim = S.trim,
        i = -1,
        l = transform.length - 1,
        split, prop, val,
        ret = cssMatrixToComputableMatrix([1, 0, 0, 1, 0, 0]),
        curr;

    // Loop through the transform properties, parse and multiply them
    while (++i < l) {
        split = transform[i].split('(');
        prop = trim(split[0]);
        val = split[1];
        curr = [1, 0, 0, 1, 0, 0];
        switch (prop) {
            case 'translateX':
                curr[4] = parseInt(val, 10);
                break;

            case 'translateY':
                curr[5] = parseInt(val, 10);
                break;

            case 'translate':
                val = val.split(',');
                curr[4] = parseInt(val[0], 10);
                curr[5] = parseInt(val[1] || 0, 10);
                break;

            case 'rotate':
                val = toRadian(val);
                curr[0] = Math.cos(val);
                curr[1] = Math.sin(val);
                curr[2] = -Math.sin(val);
                curr[3] = Math.cos(val);
                break;

            case 'scaleX':
                curr[0] = +val;
                break;

            case 'scaleY':
                curr[3] = +val;
                break;

            case 'scale':
                val = val.split(',');
                curr[0] = +val[0];
                curr[3] = val.length > 1 ? +val[1] : +val[0];
                break;

            case 'skew':
                val = val.split(',');
                curr[2] = Math.tan(toRadian(val[0]));
                if (val[1]) {
                    curr[1] = Math.tan(toRadian(val[1]));
                }
                break;

            case 'skewX':
                curr[2] = Math.tan(toRadian(val));
                break;

            case 'skewY':
                curr[1] = Math.tan(toRadian(val));
                break;

            case 'matrix':
                val = val.split(',');
                curr[0] = +val[0];
                curr[1] = +val[1];
                curr[2] = +val[2];
                curr[3] = +val[3];
                curr[4] = parseInt(val[4], 10);
                curr[5] = parseInt(val[5], 10);
                break;
        }
        ret = multipleMatrix(ret, cssMatrixToComputableMatrix(curr));
    }

    return ret;
}

function cssMatrixToComputableMatrix(matrix) {
    return [
        [matrix[0], matrix[2], matrix[4]],
        [matrix[1], matrix[3], matrix[5]],
        [0, 0, 1]
    ];
}

function computableMatrixToCssMatrix(matrix) {
    return 'matrix(' + [matrix[0][0], matrix[1][0], matrix[0][1], matrix[1][1], matrix[0][2], matrix[1][2]].join(', ') + ')';
}

function setMatrix(m, x, y, v) {
    if (!m[x]) {
        m[x] = [];
    }
    m[x][y] = v;
}

function multipleMatrix(m1, m2) {
    var i;
    if (arguments.length > 2) {
        var ret = m1;
        for (i = 1; i < arguments.length; i++) {
            ret = multipleMatrix(ret, arguments[i]);
        }
        return ret;
    }

    var m = [],
        r1 = m1.length,
        r2 = m2.length,
        c2 = m2[0].length;

    for (i = 0; i < r1; i++) {
        for (var k = 0; k < c2; k++) {
            var sum = 0;
            for (var j = 0; j < r2; j++) {
                sum += m1[i][j] * m2[j][k];
            }
            setMatrix(m, i, k, sum);
        }
    }

    return m;
}

// converts an angle string in any unit to a radian Float
function toRadian(value) {
    return value.indexOf('deg') > -1 ?
        parseInt(value, 10) * (Math.PI * 2 / 360) :
        parseFloat(value);
}

//var $ = Node.all;
//var t = $('#t');
//var ok = $('#ok');
//var input = $('input');
//var css = $('#css');
//ok.on('click', function () {
//    var self = this;
//    self.disabled = true;
//    var literal = input.val();
//    t.css('transform', literal);
//    t.css('transition', 'all 3s');
//    setTimeout(function () {
//        self.disabled = false;
//        var realMatrix = t.css('transform');
//        css.html('');
//        var jsMatrix = computableMatrixToCssMatrix(matrix(literal));
//        css.append('<p> native matrix: ' + realMatrix + '</p>');
//        css.append('<p> js calculated matrix: ' + jsMatrix + '</p>');
//        css.append('<p> js unmatrix native matrix: ' + JSON.stringify(decomposeMatrix(realMatrix)) + '</p>');
//        css.append('<p> js unmatrix js matrix: ' + JSON.stringify(decomposeMatrix(jsMatrix)) + '</p>');
//    }, 5000);
//});