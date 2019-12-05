module.exports = {
  /**
   * 绑定路由
   * @param {Express} app 
   */
  createRoutes(app) {
    app.post('/login', doLoginHandler);
    app.get('/login', checkAuthedHandler);
    app.get('/myinfo', getUserInfoHandler);
    app.get('/user/:uid/info', getUserInfoByIdHandler);
    app.post('/myinfo', updateUserInfoHandler);
  }
}

const request = require("request");
const common = require("../utils/common");
const constConf = require("../conf/constConf");

const userServices = require("../service/userServices");
const authServices = require("../service/authServices");

function checkAuthedHandler(req, res) {
  if(authServices.checkUserAuthed(req)) common.sendSuccess(res, '已登录', authServices.getLoggedUserId(req)); 
  else common.sendFailed(res, '未登录'); 
}
/**
 * 默认处理器
 * @param {Request} req 
 * @param {Response} res 
 */
function doLoginHandler(req, res) {

  if(!req.body.code) return common.sendFailed(res, '请求不合法');

  var code = req.body.code;
  var url = `https://api.weixin.qq.com/sns/jscode2session?appid=${constConf.APPID}&secret=${constConf.APPID_SECRET}&js_code=${code}&grant_type=authorization_code`;

  request({
    url: url,
    method: "get",
    json: true,
    headers: { "content-type": "application/json", },
  }, function (error, response, body) {
    if(error) common.sendFailed(res, '暂时无法登录微信，请稍后重试。错误：' + error.message);
    else if (response.statusCode == 200) {
      if(!body.error || body.error == 0) {

        //用户是否已经在本站注册
        userServices.checkUserExistsByWeixinOpenId(body.openid, (exists, id) => {
          if(exists) { 
            req.session.userid = id;
            common.sendSuccess(res, '登录成功', id);
          }
          else {
            //不存在，插入记录
            userServices.addUser(body.openid, (success, newId) => {
              if(success) { 
                req.session.userid = newId;
                common.sendSuccess(res, '登录成功', newId); 
              }
              else { 
                req.session.userid = undefined;
                common.sendFailed(res, '服务器错误', null, 500);
              }
            });
          }
        })
      }else if(body.error == -1 || body.error == 45011) {
        req.session.userid = undefined;
        common.sendFailed(res, '操作过于频繁，请稍后再试', body.error);
      }else common.sendFailed(res, '错误 :'  + body.error, body.error);
    } else common.sendFailed(res, '暂时无法登录微信，请稍后重试。错误代码：' +  response.statusCode);
  });
}
/**
 * 获取当前用户信息
 * @param {Request} req 
 * @param {Response} res 
 */
function getUserInfoHandler(req, res) {
  if(!authServices.checkUserAuthed(req)) {
    common.sendFailed(res, '未登录，请登录后操作', null, 401);
    return;
  }
  userServices.getUserInfo(authServices.getLoggedUserId(req), (data) => {
    if(data) common.sendSuccess(res, '成功', data);
    else common.sendFailed(res, '找不到用户信息', null, 404);
  })
}
/**
 * 更新当前用户信息
 * @param {Request} req 
 * @param {Response} res 
 */
function updateUserInfoHandler(req, res) {
  var body = req.body;
  if(!body) {
    common.sendFailed(res, '参数错误');
    return;
  }
  if(!authServices.checkUserAuthed(req)) {
    common.sendFailed(res, '未登录，请登录后操作', null, 401);
    return;
  }
  
  userServices.updateUserInfo(authServices.getLoggedUserId(req), body.address, body.name, body.phone, (success) => {
    if(success) common.sendSuccess(res, '修改成功', null);    
    else common.sendFailed(res, '修改失败！服务器错误', null, 500);
  });
}
/**
 * 获取当前用户信息
 * @param {Request} req 
 * @param {Response} res 
 */
function getUserInfoByIdHandler(req, res) {

  var uid = req.param.uid;

  if(!uid) {
    common.sendFailed(res, '参数错误');
    return;
  }
  if(!authServices.checkUserAuthed(req)) {
    common.sendFailed(res, '未登录，请登录后操作');
    return;
  }

  userServices.getUserInfo(uid, (data) => {
    if(data) common.sendSuccess(res, '成功', data);
    else common.sendFailed(res, '找不到用户信息', null, 404);
  })
}
