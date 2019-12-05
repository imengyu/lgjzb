module.exports = {
  /**
   * 绑定路由
   * @param {Express} app 
   */
  createRoutes(app) {
    app.get('/jobs', getJobsHandler);
    app.get('/search-jobs', searchJobsHandler);
    app.get('/user/:uid/jobs', getJobsByUserHandler);
    app.get('/user/:uid/signs', getSignJobsByUserHandler);
    app.post('/signup-job/:id', signJobHandler);
    app.post('/cancel-signup-job/:id', unsignJobHandler);
    app.post('/contract-signup-job/:id', contrctJobHandler);

    app.post('/jobs', postJobsHandler);
    app.delete('/jobs/:id', deleteJobsHandler);
    app.delete('/jobs/:id/mine', deleteJobsRealHandler)
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
 * 搜索工作信息
 * @param {Request} req 
 * @param {Response} res 
 */
function searchJobsHandler(req, res) {
  jobsServices.getJobsByKeyword(res, req.query.keyword);
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

  var job_id = req.params.id;
  var current_uid = authServices.getLoggedUserId(req);

  jobsServices.getJobSigned(current_uid, job_id, (signed) => {
    if(signed) common.sendFailed(res, '您已经报名此工作');
    else {
      jobsServices.getJobUid(job_id, (uid) => {
        if(uid == current_uid) common.sendFailed(res, '您不能报名自己发布的工作');
        else jobsServices.signJob(current_uid, job_id, (success) => {
          if(success) common.sendSuccess(res, '报名成功');
          else common.sendFailed(res, '报名失败，请稍后再试');
        });
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
      jobsServices.unsignJob(req.params.id, (success) => {
        if(success) common.sendSuccess(res, '取消报名成功');
        else common.sendFailed(res, '取消报名失败，请稍后再试');
      });
    }
  })

}
/**
 * 工作签订合同
 * @param {Request} req 
 * @param {Response} res 
 */
function contrctJobHandler(req, res) {

  var contract = req.query.contract == 'true';
  var job_id = req.params.id;

  if(!job_id) {
    common.sendFailed(res, '参数不合法');
    return;
  }
  if(!authServices.checkUserAuthed(req)) {
    common.sendFailed(res, '未登录，请登录后操作');
    return;
  }

  jobsServices.getJobUid(job_id, (id) => {
    if(id != authServices.getLoggedUserId(req)) common.sendFailed(res, '您无法操作他人的工作');
    else {
      jobsServices.contractJob(job_id, contract, (success) => {
        if(success) common.sendSuccess(res, '成功');
        else common.sendFailed(res, '操作失败，请稍后再试');
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
      jobsServices.deleteJob(job_id, (success) => {
        if(success) common.sendSuccess(res, '删除成功');
        else common.sendFailed(res, '删除失败，请稍后再试');
      });
    }
  })
}
/**
 * 删除工作信息(我的)
 * @param {Request} req 
 * @param {Response} res 
 */
function deleteJobsRealHandler(req, res) {
  var job_id = req.params.id;

  if(!authServices.checkUserAuthed(req)) {
    common.sendFailed(res, '未登录，请登录后操作');
    return;
  }
  jobsServices.getJobById(job_id, (job) => {
    if(authServices.getLoggedUserId(req) != job.signup_uid) common.sendFailed(res, '无法删除他人的工作');
    else {
      if(job.status == 3){
        jobsServices.deleteJobByUser(job_id, (success) => {
          if(success) common.sendSuccess(res, '删除成功');
          else common.sendFailed(res, '删除失败，请稍后再试');
        });
      }else if(job.status == 5){
        jobsServices.deleteJobReal(job_id, (success) => {
          if(success) common.sendSuccess(res, '删除成功');
          else common.sendFailed(res, '删除失败，请稍后再试');
        });
      }else common.sendFailed(res, '删除失败，状态不对');
    }
  })
}
