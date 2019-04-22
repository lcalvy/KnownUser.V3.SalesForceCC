'use strict';

/*
 * Implements generic httpContextProvider consumed by queueit sdk library
 * 
 */

 var Cookie = require('./node_modules/dw/web/Cookie');

exports.httpContextProvider = function() {
    return {
        getHttpRequest: function() {
            return {
                getAbsoluteUri: function() { 
					const protocol = this.getHeader('x-forwarded-proto') || this.getHeader('x-is-server_port_secure') === "1" ? 'https' : 'http';
                    return protocol  + '://' + this.getHeader('x-is-host') + this.getHeader('x-is-path_translated');
                },
                getUserAgent: function() { 
                	 request.httpUserAgent;
                },
                getHeader: function (name)
                {
        			var headers = request.httpHeaders;
        			if (headers.containsKey(name))
        			{
        				return headers.get(name);
        			}
        			return '';
        		},
        		getUserHostAddress : function()
        		{
        			return request.httpHost;
        		},
        		getCookieValue : function (cookieKey)
        		{
        			var cookies = request.getHttpCookies();
					
        			if (cookieKey in cookies)
        			{
        				return cookies[cookieKey].getValue();
        			}
        			else { 
        				return '';
        			}
        		}, 
        		getBody: function() 
        		{ 
        			
        			if (request.httpParameterMap.requestBodyAsString) { 
        				return request.httpParameterMap.requestBodyAsString;
        			}
        			return '';
        		}
            }
            
            
        },
        getHttpResponse: function() {
            return {
            	setCookie : function(cookieName, cookieValue, domain, expir) {
            		
            		var cookieToAdd = Cookie(cookieName, cookieValue);
					if (domain && domain !== '') {
						cookieToAdd.domain = domain;
					}
					cookieToAdd.setMaxAge(expir);
        			
        			response.addHttpCookie(cookieToAdd);
        			return '';
            	}
            }}
    };
};


