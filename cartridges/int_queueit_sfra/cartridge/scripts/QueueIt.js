'use strict';

/**
 * Controller for handling QueueIt Operations.
 * @module controllers/Page
 */


/* @modules */
//var QueueIT = require('./queueit_knownuserv3_sdk.js')
var objMgr = require('dw/object/CustomObjectMgr');
var httpCtx = require('./httpContextProvider.js');

const QueueIT = require("./queueit_knownuserv3_sdk.js"); 

/**
 * Implements the Queue It process
 * Checks for custom site preferences, matches to request, redirects to queue it if appropriate. 
 *  
 */
exports.Start = function(configs) {

	var prov = httpCtx.httpContextProvider();
	
	var requestUrl = prov.getHttpRequest().getAbsoluteUri();
	
	var configurations = objMgr.getAllCustomObjects('queueit');
	var integrationsConfigString = "";
		
	if (configurations.count > 0)
	{
		integrationsConfigString = configurations.first().custom.queueitdata;
	}
	
	if (integrationsConfigString != "")
	{
		var configsArr = configs.split('|');
		var customerId = configsArr[0]; // Your Queue-it customer ID
		var secretKey = configsArr[1]; // Your 72 char secret key as specified in Go Queue-it self-service platform
		
		if (customerId != '' && secretKey != '')
		{
			
			// we have the keys to do the logic, yea!
			if (prov)
			{
				
				var knownUser = QueueIT.KnownUserV3.SDK.KnownUser;
				
				var requestUrlWithoutToken : string = requestUrl.toString();
				requestUrlWithoutToken = requestUrlWithoutToken.replace(new RegExp("([\?&])(" + knownUser.QueueITTokenKey + "=[^&]*)", 'i'), "");
				
				var queueitToken = '';
				if (!request.httpParameterMap.get(knownUser.QueueITTokenKey).empty) { 
					queueitToken = request.httpParameterMap.get(knownUser.QueueITTokenKey).stringValue;
				}
				configureKnownUserHashing();
				
				var validationResult = knownUser.validateRequestByIntegrationConfig( 
					      requestUrlWithoutToken, queueitToken, integrationsConfigString,
					      customerId, secretKey, prov);
			
				if (validationResult.doRedirect()) {
					// handle ajax
					if (validationResult.isAjaxResult) {
						// need to set the header and send back success
						session.custom.ajaxredirecturl = validationResult.getAjaxRedirectUrl();
						return;
						
					}
					else 
					{
						session.custom.ajaxredirecturl = null;
						var location = validationResult.redirectUrl; 
						// redirect
						response.redirect(location);
						return;
					}
				}
				
			}
			
		}
		else
		{
			session.custom.ajaxredirecturl = null;
			return; 
		}
		
	
	}

}

function configureKnownUserHashing() {
    var utils = QueueIT.KnownUserV3.SDK.Utils;
    utils.generateSHA256Hash = function (secretKey, stringToHash) {
      const mac1 = require('dw/crypto/Mac');
      var mac = mac1(mac1.HMAC_SHA_256);
      const hash = mac.digest(stringToHash, secretKey);
      const enc = require('dw/crypto/Encoding');
      const hashHex = enc.toHex(hash);
      return hashHex;
    };
}
