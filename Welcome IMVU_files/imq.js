module({},function(m){function x(a,b){return function(c){var d=Array.prototype.slice.call(arguments,1);null!==c?a(c):b.apply(null,d)}}var p=function(a){var b=[5E3,15E3,45E3,9E4,18E4];a=IMVU.BaseClass.extend("ImqConnection",{dependencies:["timer"],CLOSED:0,CONNECTING:1,AUTHENTICATING:2,AUTHENTICATED:3,WAITING:4,initialize:function(c){this._setState(this.CLOSED);this._config=c;this._config.onPreReconnectCallback=this._config.onPreReconnectCallback||function(d){d(null,null)};this._config.pingInterval=
this._config.pingInterval||15E3;this._config.reconnect=this._config.reconnect||b;this._config.serverTimeoutInterval=this._config.serverTimeoutInterval||6E4;this._currentStrategy=this._stream=null;this._connectRetryIntervalIndex=this._currentStrategyIndex=0;this._lastMessageTime=this._receivedMessageTimerHandle=this._pingTimerHandler=this._connectRetryTimerHandle=null},connect:function(){if(this.state===this.WAITING||this.state===this.CLOSED)this._clearConnectRetryTimer(),this._setState(this.CONNECTING),
this._currentStrategyIndex>=this._config.strategies.length&&(this._currentStrategyIndex=0),this._currentStrategy=this._config.strategies[this._currentStrategyIndex],this._currentStrategyIndex++,console.log("Connecting to IMQ via '"+this._currentStrategy.URL+"' as user '"+this._config.userId+"'"),this._stream=this._currentStrategy.connect(),this._stream.on("open",function(c){this._onOpen(c)}.bind(this)),this._stream.on("message",this._onMessage,this),this._stream.on("error",this._onError,this),this._stream.on("close",
this._onClose,this),this._scheduleServerTimeout()},send:function(c,d){this._send(c,d)},close:function(){console.log("Disconnecting from IMQ");this._reset();this._disconnect();this._setState(this.CLOSED)},_setState:function(c,d){this.state=c;c===this.WAITING?this.trigger("state",c,this._config.timer.getTime()+d):this.trigger("state",c)},_onOpen:function(c){this._setState(this.AUTHENTICATING);this._stream.send(this._currentStrategy.encode("msg_c2g_connect",{user_id:this._config.userId,cookie:this._config.sessionId,
metadata:this._config.metadata}))},_onMessage:function(c){this._scheduleServerTimeout();this._lastMessageTime=this._config.timer.getTime();c=this._currentStrategy.decode(c.data);this.state===this.AUTHENTICATING?("msg_g2c_result"===c.type?null===c.data.error?(console.log("IMQ authenticated"),this._sendOpenFloodgates(),this._onAuthenticated()):console.log("Failed to authenticate with IMQ: "+c.data.error):console.log("unexpected message type during IMQ authentication: "+c.type),this.state!==this.AUTHENTICATED&&
this._onDisconnected()):"msg_g2c_pong"!==c.type&&this.trigger("message",c)},_onError:function(c){console.log("IMQ WebSocket error!")},_onClose:function(){this._onDisconnected()},_onDisconnected:function(){this._disconnect();console.log("Connection to IMQ closed");this._reconnect()},_onAuthenticated:function(){this._setState(this.AUTHENTICATED);this._reset()},_reset:function(){this._currentStrategyIndex=this._connectRetryIntervalIndex=0},_disconnect:function(){this._clearConnectRetryTimer();this._clearPingTimer();
this._clearServerTimer();null!==this._stream&&(this._stream.off(),this._stream.close(),this._stream=null)},_clearConnectRetryTimer:function(){null!==this._connectRetryTimerHandle&&(this._config.timer.clearTimeout(this._connectRetryTimerHandle),this._connectRetryTimerHandle=null)},_reconnect:function(){if(this._currentStrategyIndex<this._config.strategies.length)this.state=this.WAITING,this.connect();else{this._connectRetryIntervalIndex===this._config.reconnect.length&&(this._connectRetryIntervalIndex=
0);var c=this._config.reconnect[this._connectRetryIntervalIndex];console.log("Reconnecting to IMQ in "+c/1E3+" seconds");this._setState(this.WAITING,c);this._connectRetryTimerHandle=this._config.timer.setTimeout(function(){this._config.onPreReconnectCallback(function(d,f){null!==d?(console.log("Error in IMQ pre-reconnect callback: "+d),this._reconnect()):(_.extend(this._config,f),this._currentStrategyIndex=0,this.connect())}.bind(this),this._config.timer.getTime()-this._lastMessageTime)}.bind(this),
c);this._connectRetryIntervalIndex++}},_sendOpenFloodgates:function(){this._send("msg_c2g_open_floodgates",{})},_send:function(c,d){this._schedulePing();this._stream.send(this._currentStrategy.encode(c,d))},_scheduleServerTimeout:function(){this._clearServerTimer();this._receivedMessageTimerHandle=this._config.timer.setTimeout(this._onServerTimeout.bind(this),this._config.serverTimeoutInterval)},_clearServerTimer:function(){null!==this._receivedMessageTimerHandle&&(this._config.timer.clearTimeout(this._receivedMessageTimerHandle),
this._receivedMessageTimerHandle=null)},_onServerTimeout:function(){console.log("No message from IMQ server for "+this._config.serverTimeoutInterval/1E3+" seconds, disconnecting");this._onDisconnected()},_schedulePing:function(){this._clearPingTimer();this._pingTimerHandle=this._config.timer.setTimeout(this._sendPing.bind(this),this._config.pingInterval)},_clearPingTimer:function(){null!==this._pingTimerHandle&&(this._config.timer.clearTimeout(this._pingTimerHandle),this._pingTimerHandle=null)},_sendPing:function(){this._send("msg_c2g_ping",
{})}});_.extend(a.prototype,Backbone.Events);return a}({});m=function(a){return IMVU.BaseClass.extend("ImqConnectionStrategy",{connect:function(b){throw Error("ImqConnectionStrategy connect() function must be overridden");},encode:function(b){throw Error("ImqConnectionStrategy encode() function must be overridden");},decode:function(b){throw Error("ImqConnectionStrategy decode() function must be overridden");}})}({});var q=function(a){a=IMVU.BaseClass.extend("ImqStream",{CONNECTING:0,OPEN:1,CLOSING:2,
CLOSED:3,intialize:function(){this.state=null},send:function(b){throw Error("ImqStream send method must be overridden");},close:function(){throw Error("ImqStream close method must be overridden");}});_.extend(a.prototype,Backbone.Events);return a}({}),y=function(a){return a.ImqStream.extend("ImqHttpStream",{dependencies:["timer","XMLHttpRequest"],initialize:function(b){this._config=b;this._timer=this._config.timer;this.XMLHttpRequest=this._config.serviceProvider.get("XMLHttpRequest");this.URL=this._config.httpUrl;
this._connectionId=b.connectionId;this._retryDelay=b.networkErrorRetryDelay||2E3;this._maxRetries=b.maxNetworkErrorRetries||5;this._debug=b.debug||!1;this._sendSeq=1;this._ackSeq=this._requestSeq=0;this._requestQueue=[];this._receiveBuffer={};this._requestCount=0;this._openTimerHandle=this._config.timer.setTimeout(function(){this._log("connecting to",this.URL);this._openTimerHandle=null;this.trigger("open",{})}.bind(this),1)},send:function(b){this._requestSeq++;var c=this._requestSeq,d=this._makeFrame([b],
c);c={seq:c,data:b,xhr:null,retry:null,url:null};this._requestQueue.push(c);this._log("send message",b);this._sendRequest(d,c)},close:function(){this._log("closing stream");null!==this._openTimerHandle?(this._config.timer.clearTimeout(this._openTimerHandle),this._openTimerHandle=null):this._close()},_makeFrame:function(b,c){return{record:"http_framing",session_id:this._connectionId,seq:c,ack:this._ackSeq,data:_.map(b,function(d){return{record:"framing",type:0,data:d}})}},_sendRequest:function(b,c){var d=
0,f=function(){this._requestCount--;c.xhr.onload=null;c.xhr.onerror=null;200===c.xhr.status?(this._log(c.url,"<--",c.xhr.responseText),this._handleResponse(c.xhr.responseText,c)):(this._log("error response from server, closing connection:",c.xhr.status),this._close())}.bind(this),g=function(e){this._requestCount--;c.xhr.onload=null;c.xhr.onerror=null;this._log("network error sending frame",b,e);d<this._maxRetries?(this._log("retrying in",this._retryDelay/1E3,"seconds"),d++,c.xhr=null,c.retry=this._timer.setTimeout(function(){c.retry=
null;(0===this._requestCount||0<b.data.length)&&h()}.bind(this),this._retryDelay)):(this._log("maximum retries reached (",this._maxRetries,"), closing connection"),this._close())}.bind(this),h=function(){this._requestCount++;var e=this._makeRequestURL();c.url=e;this._log(c.url,"--\x3e",b);c.xhr=new this.XMLHttpRequest;c.xhr.open("POST",e,!0);c.xhr.setRequestHeader("Accept","application/octet-stream");c.xhr.setRequestHeader("Content-Type","application/octet-stream");c.xhr.onload=f;c.xhr.onerror=g;
c.xhr.timeout=6E4;c.xhr.send(JSON.stringify(b))}.bind(this);h()},_makeRequestURL:function(){var b=this.URL+"?seq="+this._sendSeq;this._sendSeq++;return b},_handleResponse:function(b,c){var d=null;try{d=JSON.parse(b)}catch(e){this._log("error decoding response json, closing connection:",e);this._close();return}if(this._validateFrame(d)){for(;0<this._requestQueue.length;){var f=this._requestQueue[0];if(f.seq>d.ack)break;this._log("removing sequence",f.seq,"from send queue");this._requestQueue.shift()}b=
[];if(0<d.seq){f=d.seq-d.data.length+1;for(var g=0;g<d.data.length;g++){var h=d.data[g];this._log("received message sequence",f,":",h.data);if("msg_g2c_connection_closed"===h.data.record){this._log("aborting connecting due to msg_g2c_connection_closed message");this._close();return}"undefined"===typeof this._receiveBuffer[f]&&f>this._ackSeq&&(this._receiveBuffer[f]=h.data);f++}d=_.range(this._ackSeq+1,d.seq+1);for(g=0;g<d.length;g++){f=d[g];if("undefined"===typeof this._receiveBuffer[f]){this._log("sequence",
f,"is missing, not delivering or acking messages beyond sequence",this._ackSeq);break}this._ackSeq=f;b.push(this._receiveBuffer[f]);delete this._receiveBuffer[f]}}d=0;h=[];for(g=0;g<this._requestQueue.length;g++){f=this._requestQueue[g];if(f.seq>c.seq)break;this._log("sequence",f.seq,"was not acknowledged, resending");h.push(f.data);d=f.seq}0<h.length&&(g=this._makeFrame(h,d),this._sendRequest(g,c));_.each(b,function(e){this.trigger("message",{data:e})}.bind(this));0===this._requestCount&&(this._log("no outstanding requests, initiating poll request"),
this._sendRequest(this._makeFrame([],0),c))}else this._log("invalid frame received, closing connection:",d),this._close()},_validateFrame:function(b){return"object"===typeof b&&"http_framing"===b.record&&"number"===typeof b.seq&&"number"===typeof b.ack&&"object"===typeof b.data&&Array.isArray(b.data)&&_.reduce(b.data,function(c,d){return c&&"object"===typeof d&&"framing"===d.record&&"object"===typeof d.data},!0)},_close:function(){_.each(this._requestQueue,function(b){null!==b.xhr&&b.xhr.abort();
null!==b.retry&&this._timer.clearTimeout(b.retry)}.bind(this));this.trigger("close",{})},_log:function(){if(this._debug){var b=[(new Date).toLocaleString()];_.each(arguments,function(c){b.push(c)});console.log.apply(console,b)}}})}({ImqStream:q}),u=function(a){function b(){Error.apply(this,arguments)}function c(e){var l=h[e.record];if("undefined"===typeof l)throw new b('Unable to parse "'+e.record+'" incoming message');return{type:e.record,data:l(e)}}var d=function(e){return window.btoa(window.unescape(window.encodeURIComponent(e)))},
f=function(e){return window.decodeURIComponent(window.escape(window.atob(e)))};b.prototype=Error();var g={msg_c2g_send_message:function(e){return{record:"msg_c2g_send_message",queue:e.queueName,mount:e.mountName,message:d(e.message),op_id:e.op_id}},msg_c2g_state_change:function(e){return{record:"msg_c2g_state_change",queue:e.queueName,mount:e.mountName,properties:g.state_property(e.delta)}},state_property:function(e){return _(e).reduce(function(l,k,z){l.push({record:"state_property",key:z,value:d(k)});
return l},[])},msg_c2g_unsubscribe:function(e){return{record:"msg_c2g_unsubscribe",queues:e}},msg_c2g_subscribe:function(e){return{record:"msg_c2g_subscribe",queues:e}},msg_c2g_connect:function(e){return{record:"msg_c2g_connect",user_id:e.user_id,cookie:d(e.cookie),metadata:_.map(e.metadata,function(l,k){return{record:"metadata",key:k,value:d(l)}})}},msg_c2g_open_floodgates:function(e){return{record:"msg_c2g_open_floodgates"}},msg_c2g_ping:function(e){return{record:"msg_c2g_ping"}}};var h={msg_g2c_result:function(e){return{opId:e.op_id,
error:0===e.status?null:e.error_message}},msg_g2c_joined_queue:function(e){return{queueName:e.queue,userId:e.user_id}},msg_g2c_left_queue:function(e){return{queueName:e.queue,userId:e.user_id}},msg_g2c_create_mount:function(e){var l={1:"message",2:"state"}[e.type],k={};if("undefined"===typeof l)throw new b("Mount created of unknown type: "+e.type);k.type=l;k.queueName=e.queue;k.mountName=e.mount;"state"===l&&(k.state=h._property_list(e.properties));return k},_property_list:function(e){return _(e).reduce(function(l,
k){k=c(k);l[k.data.key]=k.data.value;return l},{})},state_property:function(e){return{key:e.key,value:f(e.value)}},msg_g2c_send_message:function(e){return{queueName:e.queue,mountName:e.mount,userId:f(e.user_id),message:f(e.message),op_id:e.op_id}},msg_g2c_state_change:function(e){return{queueName:e.queue,mountName:e.mount,userId:e.user_id,delta:h._property_list(e.properties)}},msg_g2c_pong:function(e){return{}}};return{utf8_to_b64:d,b64_to_utf8:f,encode:function(e,l){var k=g[e];if("undefined"===typeof k)throw new b('Unable to parse "'+
e+'" outgoing message');return JSON.stringify([k(l)])},decode:function(e){return c(JSON.parse(e))},ImqMessageUnknown:b}}({}),A=function(a){var b=a.ImqHttpStream,c=a.ImqTranscoder;return a.ImqConnectionStrategy.extend("ImqHttpConnectionStrategy",{initialize:function(d){this.config=d;this.URL=d.httpUrl},connect:function(){var d=[];if("undefined"!==typeof window.crypto)d=new Uint8Array(32),window.crypto.getRandomValues(d),d=_.map(d,function(g){return g&15});else for(var f=0;32>f;f++)d.push(Math.floor(16*
Math.random()));this.config.connectionId=this.config.sessionId+_.reduce(d,function(g,h){return g+(9<h?String.fromCharCode(97+(h-10)):String.fromCharCode(48+h))},"");return new b(this.config)},encode:function(d,f){d=c.encode(d,f);return JSON.parse(d)[0]},decode:function(d){d=JSON.stringify(d);return c.decode(d)}})}({ImqConnectionStrategy:m,ImqHttpStream:y,ImqTranscoder:u});q=function(a){return a.ImqStream.extend("ImqWebSocketStream",{initialize:function(b){this.socket=b;this.state=this.CONNECTING;
this._openCallback=this._onOpen.bind(this);this._messageCallback=this._onMessage.bind(this);this._errorCallback=this._onError.bind(this);this._closeCallback=this._onClose.bind(this);this._addListeners()},send:function(b){this.socket.send(b)},close:function(){if(this.state===this.CONNECTING||this.state===this.OPEN)this.state=this.CLOSING,this.socket.close()},_addListeners:function(){this.socket.addEventListener("open",this._openCallback);this.socket.addEventListener("message",this._messageCallback);
this.socket.addEventListener("error",this._errorCallback);this.socket.addEventListener("close",this._closeCallback)},_removeListeners:function(){this.socket.removeEventListener("open",this._openCallback);this.socket.removeEventListener("message",this._messageCallback);this.socket.removeEventListener("error",this._errorCallback);this.socket.removeEventListener("close",this._closeCallback);this.socket=null},_onOpen:function(b){this.state=this.OPEN;this.trigger("open",b)},_onMessage:function(b){this.trigger("message",
b)},_onError:function(b){this.trigger("error",b)},_onClose:function(b){this.state=this.CLOSED;this._removeListeners();this.trigger("close",b)}})}({ImqStream:q});var v=function(a){var b=a.ImqWebSocketStream,c=a.ImqTranscoder;return a.ImqConnectionStrategy.extend("ImqWebSocketConnectionStrategy",{initialize:function(d){this.connectionFactory=d.socketFactory||window.WebSocket;this.URL=d.url},connect:function(){var d=new this.connectionFactory(this.URL);return new b(d)},encode:function(d,f){return c.encode(d,
f)},decode:function(d){return c.decode(d)}})}({ImqConnectionStrategy:m,ImqTranscoder:u,ImqWebSocketStream:q}),n={};n[p.prototype.CLOSED]="disconnected";n[p.prototype.CONNECTING]="connecting";n[p.prototype.AUTHENTICATING]="authenticating";n[p.prototype.AUTHENTICATED]="connected";n[p.prototype.WAITING]="disconnected";m=function(a,b){this.trigger("subscriberUpdate",{user_id:a.userId,action:a.action,queue:this.queue.name,mount:this.name,subscribers:b})};var r=IMVU.BaseClass.extend("ImqMessageMount",{initialize:function(a,
b){this.queue=a;this.name=b},handleMessage:function(a){this.trigger("message",{user_id:a.userId,queue:this.queue.name,mount:this.name,message:a.message,op_id:a.op_id})},handleSubscriberUpdate:m,sendMessage:function(a,b){this.queue.sendMessage(this.name,a,b)},unsubscribe:function(){this.queue.unsubscribe(this.name)},getSubscribers:function(){return this.queue.subscribers}});_.extend(r.prototype,Backbone.Events);var t=IMVU.BaseClass.extend("ImqStateMount",{initialize:function(a,b){this.queue=a;this.name=
b;this.state={}},__applyDelta:function(a,b){return _(b).reduce(function(c,d,f){""===b[f]?delete c[f]:c[f]=d;return c},a)},reset:function(a){this.state=a;this.trigger("stateChange",{queue:this.queue.name,mount:this.name,state:this.state})},handleStateChange:function(a){this.state=this.__applyDelta(this.state,a.delta);this.trigger("stateChange",{user_id:a.userId,queue:this.queue.name,mount:this.name,delta:a.delta,state:this.state})},handleSubscriberUpdate:m,sendStateChange:function(a,b){this.queue.sendStateChange(this.name,
a,b)},unsubscribe:function(){this.queue.unsubscribe(this.name)},getSubscribers:function(){return this.queue.subscribers}});_.extend(t.prototype,Backbone.Events);var B=IMVU.BaseClass.extend("ImqQueue",{initialize:function(a,b){this.name=b;this.manager=a;this.messageMounts={};this.stateMounts={};this.subscribers={}},initMessageMount:function(a){this._getOrCreateMessageMount(a)},initStateMount:function(a,b){this._getOrCreateStateMount(a).reset(b)},_getOrCreateMessageMount:function(a){"undefined"===typeof this.messageMounts[a]&&
(this.messageMounts[a]=new r(this,a));return this.messageMounts[a]},_getOrCreateStateMount:function(a){"undefined"===typeof this.stateMounts[a]&&(this.stateMounts[a]=new t(this,a));return this.stateMounts[a]},getMessageMount:function(a){return this._getOrCreateMessageMount(a)},getStateMount:function(a){return this._getOrCreateStateMount(a)},dispatchSubscriberUpdate:function(a){function b(d){d.handleSubscriberUpdate(a,c)}"joined"===a.action?this.subscribers[a.userId]=!0:"left"===a.action&&delete this.subscribers[a.userId];
var c=this.subscribers;_.each(this.messageMounts,b);_.each(this.stateMounts,b)},dispatchMessage:function(a,b,c){this.getMessageMount(a).handleMessage(b)},dispatchState:function(a,b){this.getStateMount(a).handleStateChange(b)},sendMessage:function(a,b,c){this.manager.sendMessage(this.name,a,b,c)},sendStateChange:function(a,b,c){this.manager.sendStateChange(this.name,a,b,c)},unsubscribe:function(a){"undefined"!==typeof this.messageMounts[a]&&(this.messageMounts[a].off(),delete this.messageMounts[a]);
"undefined"!==typeof this.stateMounts[a]&&(this.stateMounts[a].off(),delete this.stateMounts[a]);0===Object.keys(this.stateMounts).length&&0===Object.keys(this.messageMounts).length&&this.manager.unsubscribeQueue(this.name,function(b){b&&("Cannot send data: Not authenticated!"!==b?console.error("Error unsubscribing from queue",this.name,":",b):console.error("error unsubbing while disconnected",b,"for queue",this.name))})}});m=IMVU.BaseClass.extend("ImqManager",{dependencies:["Promise","timer"],initialize:function(a){this.config=
a;this.Promise=a.Promise;this.timer=a.timer;this.queues={};this.__queuedSubscriptions=[];this.state=new Backbone.Model({status:"disconnected",connectAt:this.timer.getTime()});var b=[];(a.socketFactory||window.WebSocket)&&b.push(new v(this.config));"undefined"!==typeof this.config.httpUrl&&b.push(new A(this.config));0===b.length&&(this.config.socketFactory=function(){return new w},b=[new v(this.config)]);this.messageOpId=1;this.messageCallbacks=[];this.config.strategies=b;this.connection=new p(a);
this.connection.on("state",this._onConnectionState.bind(this));this.connection.on("message",this._onMessage.bind(this))},connect:function(a){return new this.Promise(function(b){var c=function(){b.resolve();a&&a(null,this)};if(this.connection.state===this.connection.AUTHENTICATED)c();else{var d=function(f,g){f===this.connection.AUTHENTICATED&&(this.connection.off("state",d),c())}.bind(this);this.connection.on("state",d);this.connection.state!==this.connection.WAITING&&this.connection.state!==this.connection.CLOSED||
this.connection.connect()}}.bind(this))},subscribeState:function(a,b,c){var d=function(){this._subscribeQueue(a,function(f){return f.getStateMount(b)},c)}.bind(this);this.connection.state!==this.connection.AUTHENTICATED?this.__queuedSubscriptions.push(d):d()},subscribeMessage:function(a,b,c){var d=function(){this._subscribeQueue(a,function(f){return f.getMessageMount(b)},c)}.bind(this);this.connection.state!==this.connection.AUTHENTICATED?this.__queuedSubscriptions.push(d):d()},close:function(){this.connection.close();
_(this.queues).each(function(a){_(a.messageMounts).each(function(b){b.off()});a.messageMounts=[];_(a.stateMounts).each(function(b){b.off()});a.stateMounts=[]});this.queues=[]},sendMessage:function(a,b,c,d){a={queueName:a,mountName:b,message:c,op_id:this.messageOpId++};this._send("msg_c2g_send_message",a,d)},sendStateChange:function(a,b,c,d){this._send("msg_c2g_state_change",{queueName:a,mountName:b,delta:c},d)},_onConnectionState:function(a,b){var c={status:"undefined"!==typeof n[a]?n[a]:"unknown"};
"undefined"!==typeof b&&(c.connectAt=b);this.state.set(c);a===this.connection.AUTHENTICATED&&(_.each(this.queues,function(d){this._send("msg_c2g_subscribe",[d.name])}.bind(this)),_.each(this.__queuedSubscriptions,function(d){d()}.bind(this)),this.__queuedSubscriptions=[])},_subscribeQueue:function(a,b,c){"undefined"===typeof this.queues[a]&&this._send("msg_c2g_subscribe",[a]);c(null,b(this._getOrCreateQueue(a)))},unsubscribeQueue:function(a,b){"undefined"!==typeof this.queues[a]&&delete this.queues[a];
this._unsubscribeQueue(a,function(c){c&&("Cannot send data: Not authenticated!"!==c&&console.error("Error unsubscribing from queue",this.name,":",c),b&&b())})},_unsubscribeQueue:function(a,b){this._send("msg_c2g_unsubscribe",[a],x(b,function(){}.bind(this)))},_onMessage:function(a){var b="_on_"+a.type;if("undefined"===typeof this[b])this._onUnhandledMessage(a);else this[b](a.data)},_handleCallback:function(a,b){a.resolve?a.resolve(b):"function"===typeof a?a(b):console.error("Passed callback was not a function",
{type:typeof a,response:b,callback:a})},_send:function(a,b,c){this.connection.state===this.connection.AUTHENTICATED?(this.connection.send(a,b,b.op_id),void 0!==c&&void 0!==b.op_id&&this.messageCallbacks.push({op_id:b.op_id,function:c})):void 0!==c&&this._handleCallback(c,!1)},_getOrCreateQueue:function(a){"undefined"===typeof this.queues[a]&&(this.queues[a]=new B(this,a));return this.queues[a]},_receiveOpId:function(a,b){var c=null;a&&(c=this.messageCallbacks.find(function(d){return d.op_id===a}));
c&&c.function&&this._handleCallback(c.function,b?b:!0)},_on_msg_g2c_result:function(a){this._receiveOpId(a.opId,a.error)},_on_msg_g2c_left_queue:function(a){"undefined"!==typeof this.queues[a.queueName]&&this.queues[a.queueName].dispatchSubscriberUpdate({userId:a.userId,action:"left"})},_on_msg_g2c_joined_queue:function(a){this._getOrCreateQueue(a.queueName);this.queues[a.queueName].dispatchSubscriberUpdate({userId:a.userId,action:"joined"})},_on_msg_g2c_create_mount:function(a){switch(a.type){case "message":this._getOrCreateQueue(a.queueName).initMessageMount(a.mountName);
break;case "state":this._getOrCreateQueue(a.queueName).initStateMount(a.mountName,a.state)}},_on_msg_g2c_send_message:function(a){"undefined"!==typeof this.queues[a.queueName]&&this.queues[a.queueName].dispatchMessage(a.mountName,{userId:a.userId,message:a.message,op_id:a.op_id})},_on_msg_g2c_state_change:function(a){"undefined"!==typeof this.queues[a.queueName]&&this.queues[a.queueName].dispatchState(a.mountName,{userId:a.userId,delta:a.delta})},_onUnhandledMessage:function(a){console.warn("Unhandled IMQ message",
a)}});_.extend(m.prototype,Backbone.Events);var w=IMVU.BaseClass.extend("NoOpSocket",{initialize:function(){this.readyState=this.CLOSED},CLOSED:4,addEventListener:function(){},removeEventListener:function(){},close:function(){},send:function(){}});return{ImqManager:m,ImqMessageMount:r,ImqStateMount:t,NoOpSocket:w}});