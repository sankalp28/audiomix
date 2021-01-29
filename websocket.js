import { w3cwebsocket } from "websocket";
/**
 * @param {*} options separate error callback
 * @example  {callback: {80400012: ()=>{}}}
 */
function enhancerMessage(options) {
  return function(event) {
    if (event.data == "2") return; // heartbeat don't need deal
    let data = JSON.parse(event.data);
    const { errorCode } = data;
    if (errorCode && options.callback) {
      options.callback[errorCode] && options.callback[errorCode](data);
      return;
    }
    options.message(data);
  };
}
/**
 *
 * @param { String } url connect ws url
 * @param { Object } options about ws options
 * @param { websocketManage } parentObj
 * @returns { w3cwebsocket }  ws connect
 */
function createWs(url, options, parentObj) {
  let timer = null;
  let heartbeatTimer = null;
  const client = new w3cwebsocket(url);
  client.onopen = () => {
    const that = client;
    function sendNumber() {
      if (that.readyState === that.OPEN) {
        that.send("1");
        clearTimeout(heartbeatTimer);
        heartbeatTimer = setTimeout(sendNumber, 3000);
      } else {
        //websocket error status, need to disconnect and reconnect
        console.log(that.readyState);
        that.close();
      }
    }
    sendNumber();
  };
  client.onclose =
    options.close ||
    function() {
      // If it is not triggered manually, it needs to be reconnected
      if (parentObj.isUserClose === false) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          parentObj.client = createWs(url, options, parentObj);
        }, 1000);
      }
    };
  client.onmessage = enhancerMessage(options);
  client.onerror = () => {
    console.log(error);
    clearTimeout(timer);
    timer = setTimeout(() => {
      parentObj.client = createWs(url, options, parentObj);
    }, 1000);
  };

  return client;
}
/**
 * @param { String } url create websocket url
 * @param { Object } options include (close,message,callback)  call callback when ws error
 * @example options { close?: ()=>{}, message: ()=>{}, callback => {}}
 */
class websocketManage {
  constructor(url, options) {
    this.$url = url;
    this.$options = options;
    this.isUserClose = false;
    if (!options.message) {
      console.error("message is requied");
      return;
    }
    this.client = createWs(this.$url, this.$options, this);
  }
  /**
   *  close websocket method
   */
  close() {
    this.isUserClose = true;
    this.client.close();
  }
  /**
   * @param {Object} params send back-end message
   * @example include {type,data}, According to the back-end API
   */
  send(params) {
    this.client.send(JSON.stringify(params));
  }
}

function websocket(url, options) {
  return new websocketManage(url, options);
}

export default websocket;
