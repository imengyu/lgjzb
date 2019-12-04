const connection = require('../utils/database');
const common = require('../utils/common')
const logger = require("../utils/logger");

module.exports = {

  /**
   * 从数据库获取招聘工作信息
   * @param {Response} res 返回
   * @param {number} cate_id 父类id
   * @param {number} child_id 子类id
   */
  getJobsByType(res, cate_id, child_id) {
    if(!cate_id || !child_id) {
      common.sendFailed(res, '参数不合法');
      return;
    }
  
    //查询mysql来取得数据
    connection.getConnection().query('SELECT * FROM t_jobs WHERE parent_cate_id = ' + cate_id + 
      ' AND parent_child_id = ' + child_id, (err, results) => {
  
      //排序 按 add_time 降序排序
      results.sort((a,b) => {
        let cp = 0;
        cp=-a.add_time.localeCompare(b.add_time);
        if(cp==0) {
          if(a.id == b.id) cp = 0;
          else if(a.id > b.id) cp = 1;
          else if(a.id < b.id) cp = -1;
        }
        return cp;
      })
      common.sendSuccess(res, '成功', results);
    })
  },
  /**
   * 从数据库获取某个用户发布的招聘工作信息
   * @param {Response} res 返回
   * @param {number} uid 发布者用户 ID
   */
  getJobsByUid(res, uid) {
    if(!uid) {
      common.sendFailed(res, '参数不合法');
      return;
    }
  
    //查询mysql来取得数据
    connection.getConnection().query('SELECT * FROM t_jobs WHERE uid = ' + uid, (err, results) => {
  
      //排序 按 add_time 降序排序
      results.sort((a,b) => {
        let cp = 0;
        cp=-a.add_time.localeCompare(b.add_time);
        if(cp==0) {
          if(a.id == b.id) cp = 0;
          else if(a.id > b.id) cp = 1;
          else if(a.id < b.id) cp = -1;
        }
        return cp;
      })
      common.sendSuccess(res, '成功', results);
    })
  },
  /**
   * 从数据库获取某个用户已报名的招聘工作信息
   * @param {Response} res 返回
   * @param {number} uid 发布者用户 ID
   */
  getSignJobsByUid(res, uid) {
    if(!uid) {
      common.sendFailed(res, '参数不合法');
      return;
    }
  
    //查询mysql来取得数据
    connection.getConnection().query('SELECT * FROM t_jobs WHERE uid = ' + uid, (err, results) => {
  
      //排序 按 add_time 降序排序
      results.sort((a,b) => {
        let cp = 0;
        cp=-a.add_time.localeCompare(b.add_time);
        if(cp==0) {
          if(a.id == b.id) cp = 0;
          else if(a.id > b.id) cp = 1;
          else if(a.id < b.id) cp = -1;
        }
        return cp;
      })
      common.sendSuccess(res, '成功', results);
    })
  },
  /**
   * 检查工作是否已报名
   * @param {number} uid 用户id
   * @param {number} job_id 工作id
   * @param {(exists:boolean)=>void} callback 回调
   */
  getJobSigned(uid, job_id, callback) {
    connection.getConnection().query('SELECT * FROM t_jobs WHERE id = ' + job_id, (err, results) => {
      callback(results && results.length > 0 && results[0].signup_uid == uid)
    })
  },
  /**
   * 获取工作发布者
   * @param {number} job_id 工作id
   * @param {(id:number)=>void} callback 回调
   */
  getJobUid(job_id, callback) {
    connection.getConnection().query('SELECT uid FROM t_jobs WHERE id = ' + job_id, (err, results) => {
      if(results && results.length > 0) callback(results[0].uid)
      else callback(0)
    })
  },
  /**
   * 报名工作
   * @param {number} uid 用户id
   * @param {number} job_id 工作id
   * @param {(success:boolean)=>void} callback 回调
   */
  signJob(uid, job_id, callback) {
    connection.getConnection().query('UPDATE t_jobs SET signup_uid=?,status=2 WHERE id=?', 
      [ uid, job_id ], (error, results, fields) => {
      if (error) { callback(false); logger.error('signJob failed ! ', error); }
      else callback(true)
    });
  },
  /**
   * 取消报名工作
   * @param {number} job_id 工作id
   * @param {(success:boolean)=>void} callback 回调
   */
  unsignJob(job_id, callback) {
    connection.getConnection().query('UPDATE t_jobs SET signup_uid=0,status=1 WHERE id=?', 
      [ job_id ], (error, results, fields) => {
      if (error) { callback(false); logger.error('unsignJob failed ! ', error); }
      else callback(true)
    });
  },
  /**
   * 删除工作
   * @param {number} job_id 工作id
   * @param {(success:boolean)=>void} callback 回调
   */
  deleteJob(job_id, callback) {
    connection.getConnection().query('DELETE t_jobs WHERE id=?', 
      [ job_id ], (error, results, fields) => {
      if (error) { callback(false); logger.error('unsignJob failed ! ', error); }
      else callback(true)
    });
  },
  /** 
   * 新增工作信息至数据库
   * @param {number} uid 发布用户 id
   * @param {Response} res 返回
   * @param {*} jobData job数据
   */
  postJob(uid, res, jobData) {
    jobData['uid'] = uid;
    jobData['add_time'] = new Date().format('YYYY-MM-DD');
    var prop_arr = [], i = 0;
    var props = Object.keys(jobData);
    var props_str = '', props_pl_str = '';
    for(;i < props.length; i++) {
      if(i > 0) props_pl_str += ',?'; else props_pl_str = '?'; 
      if(i > 0) props_str += ',' + props[i]; else  props_str = props[i]; 
      
      prop_arr.push(jobData[props[i]]);
    }
  
    connection.getConnection().query('INSERT INTO t_jobs(' + props_str + ') VALUES(' + props_pl_str + ')', prop_arr, (err, results) => {
      if(err) { 
        common.sendFailed(res, '服务器错误，请稍后重试');
        logger.error('postJob failed ! ', err); 
      }
      else common.sendSuccess(res, '成功', results.insetId);
    });
  }
}