'use strict';

/**
 * Controller for handling QueueIt Operations.
 * @module controllers/Page
 */


/* @modules */
// var QueueIT = require('./queueit_knownuserv3_sdk.js')
var objMgr = require('./node_modules/dw/object/CustomObjectMgr');
var sitePrefs = require('./node_modules/dw/system/Site').getCurrent().getPreferences();
var httpCtx = require('./httpContextProvider.js');
var Mac = require ('./node_modules/dw/crypto/Mac');
var Encoding  = require ('./node_modules/dw/crypto/Encoding');
const QueueIT = require('./queueit_knownuserv3_sdk.js');

function configureKnownUserHashing() {
    var utils = QueueIT.KnownUserV3.SDK.Utils;
    utils.generateSHA256Hash = function (secretKey, stringToHash) {
      const hash = Encoding.toHex(new Mac('HmacSHA256').digest(stringToHash, secretKey));
      return hash;
    };
}

exports.configureKnownUserHashing = configureKnownUserHashing;

configureKnownUserHashing();

/**
 * Implements the Queue It process
 * Checks for custom site preferences, matches to request, redirects to queue it if appropriate.
 *
 */
exports.start = function () {
    var prov = httpCtx.httpContextProvider();

    var requestUrl = prov.getHttpRequest().getAbsoluteUri();

    var testString = QueueIT.KnownUserV3.SDK.Utils.generateSHA256Hash('SECRET_KEY', 'SECRET_STRING');

    // NOTE: probably want this to be inclusionary vs exclusionary: only do this logic if
    // page show / category show / add to cart Request Prefilter
    if (requestUrl.toString().indexOf('__Analytics') >= 0) {
        return;
    }

    var configurations = objMgr.getAllCustomObjects('queueit');
    var integrationsConfigString = '';

    if (configurations.count > 0) {
        integrationsConfigString = configurations.first().custom.queueitdata;
    }



    if (integrationsConfigString != '') {
        var queueItEnabled = false;
        if ('queueItEnabled' in sitePrefs.getCustom()) {
            queueItEnabled = sitePrefs.getCustom().queueItEnabled;
        }
        if (!queueItEnabled) {
            return;
        }

        var customerId = '';
        if ('queueItCustomerId' in sitePrefs.getCustom()) {
            customerId = sitePrefs.getCustom().queueItCustomerId; // Your Queue-it customer ID
        }

        var secretKey = '';
        if ('queueItSecretKey' in sitePrefs.getCustom()) {
            secretKey = sitePrefs.getCustom().queueItSecretKey; // Your 72 char secret key as specified in Go Queue-it self-service platform
        }


        if (customerId != '' && secretKey != '') {
            // we have the keys to do the logic, yea!
            if (prov) {
                var knownUser = QueueIT.KnownUserV3.SDK.KnownUser;

                var requestUrlWithoutToken = requestUrl.toString();
                requestUrlWithoutToken = requestUrlWithoutToken.replace(new RegExp('([\?&])(' + knownUser.QueueITTokenKey + '=[^&]*)', 'i'), '');

                var queueitToken = '';
                if (!request.httpParameterMap.get(knownUser.QueueITTokenKey).empty) {
                    queueitToken = request.httpParameterMap.get(knownUser.QueueITTokenKey).stringValue;
                }
                var validationResult = knownUser.validateRequestByIntegrationConfig(
					      requestUrlWithoutToken, queueitToken, integrationsConfigString,
					      customerId, secretKey, prov);

                if (validationResult.doRedirect()) {
                    var location = validationResult.redirectUrl;
                    // redirect
                    response.redirect(location);
                    return;
                }
            }
        } else {
            return;
        }
    }
};

exports.middleware = function (req, res, next) {
    try {
        exports.start();
        next();
    } catch (e) {
        next(e);
    }
};
