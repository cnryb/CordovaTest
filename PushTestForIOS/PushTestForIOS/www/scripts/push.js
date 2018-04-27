/// <reference path="global-vars.js" />
/// <reference path="util.js" />

var mediPM = mediPM || {};

; (function () {
    "use strict";
    //使用 DefaultListenSharedAccessSignature 更安全些，只有侦听的权限就够了
    var connString = "Endpoint=sb://medidev.servicebus.chinacloudapi.cn/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=ebgOQPuVlD8/JrQKmQZ6Js5OQ2Caea9y6BHrwizF6CA=;EntityPath=patient4mobile";
    var pushNotification = null;

    var getHub = function (connectionString) {

        var parts = connectionString.split(';');
        if (parts.length != 4)
            throw "Error parsing connection string";
        var hub = {};

        parts.forEach(function (part) {
            if (part.indexOf('Endpoint') == 0) {
                hub.endpoint = 'https' + part.substring(11);
            } else if (part.indexOf('SharedAccessKeyName') == 0) {
                hub.sasKeyName = part.substring(20);
            } else if (part.indexOf('SharedAccessKey') == 0) {
                hub.sasKeyValue = part.substring(16);
            } else if (part.indexOf('EntityPath') == 0) {
                hub.EntityPath = part.substring(11);
            }
        });

        return hub;
    }


    var getSelfSignedToken = function (targetUri, sharedKey, ruleId, expiresInMins) {
        targetUri = encodeURIComponent(targetUri.toLowerCase()).toLowerCase();

        // Set expiration in seconds
        var expireOnDate = new Date();
        expireOnDate.setMinutes(expireOnDate.getMinutes() + expiresInMins);
        var expires = Date.UTC(expireOnDate.getUTCFullYear(), expireOnDate
        .getUTCMonth(), expireOnDate.getUTCDate(), expireOnDate
        .getUTCHours(), expireOnDate.getUTCMinutes(), expireOnDate
        .getUTCSeconds()) / 1000;
        var tosign = targetUri + '\n' + expires;

        // using CryptoJS
        var signature = CryptoJS.HmacSHA256(tosign, sharedKey);
        var base64signature = signature.toString(CryptoJS.enc.Base64);
        var base64UriEncoded = encodeURIComponent(base64signature);

        // construct autorization string
        var token = "SharedAccessSignature sr=" + targetUri + "&sig="
        + base64UriEncoded + "&se=" + expires + "&skn=" + ruleId;
        // console.log("signature:" + token);
        return token;
    };


    var createRegistrationId = function (deviceToken, tag) {

        var hub = getHub(connString);

        var registrationPath = hub.EntityPath + "/Registrations/";
        var serverUrl = hub.endpoint + registrationPath + "?api-version=2015-01";

        var token = getSelfSignedToken(serverUrl, hub.sasKeyValue, hub.sasKeyName, 60);

        var registrationPayload =
        '<?xml version="1.0" encoding="utf-8"?>' +
        '<entry xmlns="http://www.w3.org/2005/Atom">' +
        '    <content type="application/xml">' +
        '        <AppleTemplateRegistrationDescription xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/netservices/2010/10/servicebus/connect">' +
        '            <Tags>{Tags}</Tags>' +
        '            <DeviceToken>{DeviceToken}</DeviceToken>' +
        '            <BodyTemplate><![CDATA[{Template for the body}]]></BodyTemplate>' +
        //'            <Expiry>{Template for Expiry in}</Expiry>' +
        '        </AppleTemplateRegistrationDescription>' +
        '    </content>' +
        '</entry>';

        registrationPayload = registrationPayload.replace("{DeviceToken}", deviceToken);


        registrationPayload = registrationPayload.replace("{Tags}", tag);
        registrationPayload = registrationPayload.replace("{Template for the body}", '{"aps": {"alert": "$(message)","sound":"default"}}');
        //registrationPayload = registrationPayload.replace("{Template for Expiry in}", "");

        var deferred = $.Deferred();
        $.ajax({
            type: "POST",
            url: serverUrl,
            data: registrationPayload,
            headers: {
                "Authorization": token
            }
        }).done(function (data, status, response) {
            var iosPushData = {};

            iosPushData.RegistrationId = data.getElementsByTagName("RegistrationId")[0].firstChild.nodeValue;
            iosPushData.DeviceToken = data.getElementsByTagName("DeviceToken")[0].firstChild.nodeValue;

            window.localStorage.setItem("iosPushData", JSON.stringify(iosPushData));

            var location = response.getResponseHeader("Content-Location");
            deferred.resolve(location);
        }).fail(function (response, status, error) {
            deferred.reject("Error: " + error);
        });
        return deferred.promise();
    };

    var createOrUpdateRegistrationId = function (deviceToken, tag) {

        var hub = getHub(connString);
        var iosPushData = window.localStorage.getItem("iosPushData");
        if (iosPushData) {
            iosPushData = JSON.parse(iosPushData);
        } else {
            iosPushData = {};
            iosPushData.RegistrationId = "";
        }

        var registrationPath = hub.EntityPath + "/Registrations/" + iosPushData.RegistrationId;
        var serverUrl = hub.endpoint + registrationPath + "?api-version=2015-01";

        var token = getSelfSignedToken(serverUrl, hub.sasKeyValue, hub.sasKeyName, 60);

        var registrationPayload =
        '<?xml version="1.0" encoding="utf-8"?>' +
        '<entry xmlns="http://www.w3.org/2005/Atom">' +
        '    <content type="application/xml">' +
        '        <AppleTemplateRegistrationDescription xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/netservices/2010/10/servicebus/connect">' +
        '            <Tags>{Tags}</Tags>' +
        '            <DeviceToken>{DeviceToken}</DeviceToken>' +
        '            <BodyTemplate><![CDATA[{Template for the body}]]></BodyTemplate>' +
        //'            <Expiry>{Template for Expiry in}</Expiry>' +
        '        </AppleTemplateRegistrationDescription>' +
        '    </content>' +
        '</entry>';

        registrationPayload = registrationPayload.replace("{DeviceToken}", deviceToken);


        registrationPayload = registrationPayload.replace("{Tags}", tag);
        registrationPayload = registrationPayload.replace("{Template for the body}", '{"aps": {"alert": "$(message)","sound":"default"}}');
        //registrationPayload = registrationPayload.replace("{Template for Expiry in}", "");

        var deferred = $.Deferred();

        var method = "POST";
        if (iosPushData.RegistrationId) {
            method = "PUT";
        }

        $.ajax({
            type: method,
            url: serverUrl,
            data: registrationPayload,
            headers: {
                "Content-Type": "application/atom+xml;type=entry;charset=utf-8",
                "Authorization": token,
                "x-ms-version": "2015-01"
            }
        }).done(function (data, status, response) {
            var iosPushData = {};

            iosPushData.RegistrationId = data.getElementsByTagName("RegistrationId")[0].firstChild.nodeValue;
            iosPushData.DeviceToken = data.getElementsByTagName("DeviceToken")[0].firstChild.nodeValue;
            iosPushData.hasError = false;

            window.localStorage.setItem("iosPushData", JSON.stringify(iosPushData));

            deferred.resolve(data);
        }).fail(function (response, status, error) {
            deferred.reject("Error: " + error);
        });
        return deferred.promise();
    };


    var readAllRegistrations = function () {

        var hub = getHub(connString);

        var registrationPath = hub.EntityPath + "/registrations/";
        var serverUrl = hub.endpoint + registrationPath + "?api-version=2015-01";

        var token = getSelfSignedToken(serverUrl, hub.sasKeyValue, hub.sasKeyName, 60);


        var deferred = $.Deferred();
        $.ajax({
            type: "GET",
            url: serverUrl,
            headers: {
                "Authorization": token,
                "x-ms-version": "2015-01"
            }
        }).done(function (data, status, response) {
            console.log(response.responseText);
            //var location = response.getResponseHeader("Content-Location");
            deferred.resolve(data);
        }).fail(function (response, status, error) {
            deferred.reject("Error: " + error);
        });
        return deferred.promise();
    };


    var deleteRegistration = function () {
        var deferred = $.Deferred();

        var iosPushData = window.localStorage.getItem("iosPushData");
        if (iosPushData) {
            iosPushData = JSON.parse(iosPushData);
        } else {
            deferred.reject("Error: 未注册");
            return deferred.promise();
        }

        var hub = getHub(connString);

        var registrationPath = hub.EntityPath + "/registrations/" + iosPushData.RegistrationId;
        var serverUrl = hub.endpoint + registrationPath + "?api-version=2015-01";

        var token = getSelfSignedToken(serverUrl, hub.sasKeyValue, hub.sasKeyName, 60);


        $.ajax({
            type: "DELETE",
            url: serverUrl,
            headers: {
                "Content-Type": "application/atom+xml;type=entry;charset=utf-8",
                "Authorization": token,
                "If-Match": "*",
                "x-ms-version": "2015-01"
            }
        }).done(function (data, status, response) {
            window.localStorage.removeItem("iosPushData");
            deferred.resolve(data, status, response);
        }).fail(function (response, status, error) {
            deferred.reject("Error: " + error);
        });
        return deferred.promise();
    };



    function registerPush() {
        var deferred = $.Deferred();
        if (cordova.exec.name === 'exec') {
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
        if (window.device.platform === 'iOS') {

            // Create a new PushNotification and start registration with the PNS.
            pushNotification = PushNotification.init({
                ios: {
                    alert: true,
                    badge: true,
                    sound: true
                }
            });

            // Handle the registration event.
            pushNotification.on('registration', function (data) {
                // Get the handle returned during registration. 
                var handle = data.registrationId;

                console.log(handle);
                window.localStorage.setItem("RegistrationId", handle);
                var iosPushData = window.localStorage.getItem("iosPushData");

                createOrUpdateRegistrationId(handle, "ios-" + g_account.userId).done(function (data) {
                    console.log("azure regedit success " + JSON.stringify(data));
                    //if (iosPushData) {
                    //    iosPushData = JSON.parse(iosPushData);
                    //    var putData = {};
                    //    putData.uuid = window.device.uuid;
                    //    putData.token = iosPushData.RegistrationId;
                    //    putData.platform = window.device.platform;


                    //    mediPM.request.sendRequest("/api/PushToken?" + $.param(putData), "put")
                    //          .done(function (data) {
                    //              deferred.resolve(data);
                    //              console.log(JSON.stringify(data));
                    //          }).fail(function (xhr) {
                    //              console.error(JSON.stringify(xhr));
                    //              deferred.reject("Error: " + JSON.stringify(xhr));
                    //          });
                    //}
                }).fail(function (data) {
                    //mediPM.util.alert("警告", "azure regedit fail " + data);
                    console.error("azure regedit fail " + data);
                    iosPushData.hasError = true;
                    window.localStorage.setItem("iosPushData", JSON.stringify(iosPushData));
                    deferred.reject("Error: " + data);
                });

            });

            // Handles the notification received event.
            pushNotification.on('notification', function (data) {
                // Display the alert message in an alert.
                //alert(data.message);
                //alert(JSON.stringify(data));
                console.log("azure notification " + JSON.stringify(data));
                // Reload the items list.
                //app.Storage.getData();
            });

            // Handles an error event.
            pushNotification.on('error', function (e) {
                // Display the error message in an alert.
                //mediPM.util.alert("警告", "azure error" + e.message);
                console.error("azure error " + JSON.stringify(e));
                deferred.reject("azure error: " + JSON.stringify(e));
            });
        } else if (g_account && window.device.platform === 'Android') {



            GeTuiSdkPlugin.callback_init(callback);
            GeTuiSdkPlugin.initialize();
        }
        function cb(data) {
            if (!data[0]) {
                console.log('个推绑定别名失败')
                return;
            }
            console.log('个推绑定别名成功')
        }
        function callback(type, data) {
            if (type == 'cid') {
                console.log(data)
                GeTuiSdkPlugin.bindAlias(cb, 'android_' + g_account.userId.replace(/-/g, ''))
            }

        }
        return deferred.promise();
    }


    function unregisterPush() {
        //if (window.tinyHippos) return;

        if (g_account && window.device.platform === 'iOS') {
            if (!pushNotification) return;

            pushNotification.unregister(function () {
                console.log('phonegap-plugin-push unregister success');
            }, function () {
                console.error('error phonegap-plugin-push unregister fail');
            });

        } else if (g_account && window.device.platform === 'Android') {

            GeTuiSdkPlugin.turnOffPush();
            console.log("个推停止推送");

            //xgpush.unregisterPush().then(function (data) {
            //    console.log("信鸽注销");
            //}).catch(function (data) {
            //    console.error("信鸽注销失败 " + JSON.stringify(data));
            //});

        }
    }


    mediPM.push = {
        registerAzurePush: createRegistrationId,
        registerPush: registerPush,
        readAllRegistrations: readAllRegistrations,
        deleteRegistration: deleteRegistration,
        unregisterPush: unregisterPush
    };
})();