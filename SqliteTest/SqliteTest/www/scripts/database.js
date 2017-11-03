
; (function () {
    "use strict";

    var _db,
        _initSqls = [],
        _clearSqls = [],
        _initialized = false,
        _upgradeSqls = [],
        _schemaVersion = 11;


    // 初始化数据库
    function init() {
        var dfr = $.Deferred(),
            dbName = "demo.db";

        if (_initialized) {
            dfr.resolve();
            return dfr.promise();
        }
        _initialized = true;
        _db = window.sqlitePlugin.openDatabase({ name: dbName, location: 'default' });

        return executeNonQuery("CREATE TABLE IF NOT EXISTS Demo (id INTEGER, name TEXT)");
    }

    // 清理数据库
    function clearDb() {
        return executeNonQuery("DELETE FROM Demo");
        //return executeNonQuery("DROP TABLE IF EXISTS Demo");
    }

    // 执行非查询类的SQL语句，返回影响的行数
    function executeNonQuery(sql, params) {
        var dfr = $.Deferred();
        if (!_db) {
            dfr.reject();
        } else {
            _db.transaction(function (tx) {
                tx.executeSql(sql, params,
                    function (tx, res) {
                        dfr.resolve(res.rowsAffected);
                    }, function (tx, err) {
                        dfr.reject(err.message);
                    });
            }, function (err) {
                dfr.reject(err.message);
            });
        }
        return dfr.promise();
    }

    // 执行多个非查询类的SQL语句
    function executeNonQueries(sqlObjs) {
        var dfr = $.Deferred();
        if (!_db) {
            dfr.reject();
        } else {
            _db.transaction(function (tx) {
                $.each(sqlObjs, function (idx, sqlObj) {
                    tx.executeSql(sqlObj.sql, sqlObj.params);
                });
            }, function (err) {
                dfr.reject(err.message);
            }, function () {
                dfr.resolve();
            });
        }
        return dfr.promise();
    }

    // 执行查询类的SQL语句，返回结果数组
    function executeQuery(sql, params) {
        var dfr = $.Deferred();
        if (!_db) {
            dfr.reject();
        } else {
            _db.transaction(function (tx) {
                tx.executeSql(sql, params,
                    function (tx, res) {
                        // 转换为JavaScript数组，WebSQL和SQLite返回的结果格式略有不同
                        var rows = [];
                        if (typeof res.rows.item === "function") {
                            for (var i = 0; i < res.rows.length; i++) {
                                rows.push(res.rows.item(i));
                            }
                        } else {
                            for (var i = 0; i < res.rows.length; i++) {
                                rows.push(res.rows[i]);
                            }
                        }
                        dfr.resolve(rows);
                    }, function (tx, err) {
                        dfr.reject(err.message);
                    });
            }, function (err) {
                dfr.reject(err.message);
            });
        }
        return dfr.promise();
    }

    window.mediPM = window.mediPM || {};

    mediPM.database = {
        init: init,
        clearDb: clearDb,

        executeNonQuery: executeNonQuery,
        executeNonQueries: executeNonQueries,
        executeQuery: executeQuery
    };
})();