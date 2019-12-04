module.exports = {
  /**
   * 绑定路由
   * @param {Express} app 
   */
  createRoutes(app) {
    app.get('/jobs', getJobsHandler);
    app.get('/user/:id/jobs', getJobsByUserHandler);
    app.get('/user/:id/signs', getSignJobsByUserHandler);
    app.post('/signup-job/:id', signJobHandler);
    app.post('/cancel-signup-job/:id', unsignJobHandler);
    app.post('/jobs', postJobsHandler)
    app.delete('/jobs/:id', deleteJobsHandler)
  }
}

const common = require("../utils/common");

const jobsServices = require("../service/jobsServices");
const authServices = require("../service/authServices");

/**
 * 获取工作信息
 * @param {Request} req 
 * @param {Response} res 
 */
function getJobsHandler(req, res) {
  var cate_id = req.query.cate_id;
  var child_id = req.query.child_id;
  jobsServices.getJobsByType(res, cate_id, child_id);
}
/**
 * 获取用户发布的工作信息
 * @param {Request} req 
 * @param {Response} res 
 */
function getJobsByUserHandler(req, res) {
  jobsServices.getJobsByUid(res, req.params.uid);
}
/**
 * 获取用户发布的工作信息
 * @param {Request} req 
 * @param {Response} res 
 */
function getSignJobsByUserHandler(req, res) {
  jobsServices.getSignJobsByUid(res, req.params.uid);
}
/**
 * 报名工作
 * @param {Request} req 
 * @param {Response} res 
 */
function signJobHandler(req, res) {

  if(!authServices.checkUserAuthed(req)) {
    common.sendFailed(res, '未登录，请登录后操作');
    return;
  }

  jobsServices.getJobSigned(authServices.getLoggedUserId(req), req.params.id, (signed) => {
    if(signed) common.sendFailed(res, '您已经报名此工作');
    else {
      jobsServices.signJob(authServices.getLoggedUserId(req), req.params.id, (success) => {
        if(success) common.sendSuccess(res, '报名成功');
        else common.sendFailed(res, '报名失败，请稍后再试');
      });
    }
  })

}
/**
 * 取消报名工作
 * @param {Request} req 
 * @param {Response} res 
 */
function unsignJobHandler(req, res) {

  if(!authServices.checkUserAuthed(req)) {
    common.sendFailed(res, '未登录，请登录后操作');
    return;
  }

  jobsServices.getJobSigned(authServices.getLoggedUserId(req), req.params.id, (signed) => {
    if(!signed) common.sendFailed(res, '您没有报名此工作');
    else {
      jobsServices.signJob(authServices.getLoggedUserId(req), req.params.id, (success) => {
        if(success) common.sendSuccess(res, '报名成功');
        else common.sendFailed(res, '报名失败，请稍后再试');
      });
    }
  })

}

/**
 * 发布工作信息
 * @param {Request} req 
 * @param {Response} res 
 */
function postJobsHandler(req, res) {
  var body = req.body;

  if(!body) {
    common.sendFailed(res, '参数不合法');
    return;
  }
  if(!authServices.checkUserAuthed(req)) {
    common.sendFailed(res, '未登录，请登录后操作');
    return;
  }

  jobsServices.postJob(authServices.getLoggedUserId(req), res, body);
}

/**
 * 删除工作信息
 * @param {Request} req 
 * @param {Response} res 
 */
function deleteJobsHandler(req, res) {
  var job_id = req.params.id;

  if(!authServices.checkUserAuthed(req)) {
    common.sendFailed(res, '未登录，请登录后操作');
    return;
  }
  jobsServices.getJobUid(job_id, (uid) => {
    if(authServices.getLoggedUserId(req) != uid) 
      common.sendFailed(res, '您只能删除自己发布的工作');
    else {
      obsServices.deleteJob(job_id, (success) => {
        if(success) common.sendSuccess(res, '删除成功');
        else common.sendFailed(res, '删除失败，请稍后再试');
      });
    }
  })

  j
}