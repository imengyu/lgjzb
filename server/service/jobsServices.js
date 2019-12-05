const connection = require('../utils/database');
const common = require('../utils/common')
const logger = require("../utils/logger");
const urlencode = require('urlencode');

const userServices = require("../service/userServices");

module.exports = {

  /**
   * 状态： 
   * 1：正常，等待报名
   * 2：已报名，等待发布者签订合同
   * 3：已签订合同
   * 4：未签订合同后删除
   * 5：已签订合同后删除
   */

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
    connection.getConnection().query('SELECT * FROM t_jobs WHERE status = 1 AND parent_cate_id = ' + cate_id + 
      ' AND parent_child_id = ' + child_id, (err, results) => {
      if(results && results.length > 0) {
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
      }else common.sendSuccess(res, '成功', []);
    })
  },

  /**
   * 从数据库搜索招聘工作信息
   * @param {Response} res 返回
   * @param {number} keyword 关键词
   */
  getJobsByKeyword(res, keyword) {
    if(!keyword || keyword == '') {
      common.sendFailed(res, '参数不合法');
      return;
    }

    keyword = urlencode.decode(keyword);
  
    //查询mysql来取得数据
    connection.getConnection().query('SELECT * FROM t_jobs WHERE status = 1 AND (name like \'%' + keyword + 
      '%\' OR address like \'%' + keyword + 
      '%\' OR time like \'%' + keyword + 
      '%\' OR treatment like \'%' + keyword + 
      '%\')', (err, results) => {
      if(results && results.length > 0) {
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
      }else common.sendSuccess(res, '成功', []);
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
    connection.getConnection().query('SELECT * FROM t_jobs WHERE status < 4 AND uid = ' + uid, (err, results) => {
      if(results && results.length > 0) {
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

        //获取已报名用户的信息
        for(var i =0 ;i<results.length;i++){
          if(results[i].signup_uid > 0) {
            userServices.getUserInfo(results[i].signup_uid, (data) => {
              if(data) results[i].signed = {
                name: data.name,
                phone: data.phone,
                address: data.address,
              }
            })
          }
        }
        common.sendSuccess(res, '成功', results);
      } else common.sendSuccess(res, '成功', []);
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
    connection.getConnection().query('SELECT * FROM t_jobs WHERE signup_uid = ' + uid, (err, results) => {
  
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
    connection.getConnection().query('SELECT * FROM t_jobs WHERE status = 1 AND id = ' + job_id, (err, results) => {
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
   * 获取工作报名者
   * @param {number} job_id 工作id
   * @param {(id:number)=>void} callback 回调
   */
  getJobSignUid(job_id, callback) {
    connection.getConnection().query('SELECT signed_uid FROM t_jobs WHERE id = ' + job_id, (err, results) => {
      if(results && results.length > 0) callback(results[0].signed_uid)
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
    connection.getConnection().query('UPDATE t_jobs SET signup_uid=?,status=? WHERE id=?', 
      [ uid, 2, job_id ], (error, results, fields) => {
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
    connection.getConnection().query('UPDATE t_jobs SET signup_uid=?,status=? WHERE id=?', 
      [ 0, 1, job_id ], (error, results, fields) => {
      if (error) { callback(false); logger.error('unsignJob failed ! ', error); }
      else callback(true)
    });
  },
  /**
   * 签订工作合同/取消
   * @param {number} job_id 工作id
   * @param {boolean} sign 是否签订
   * @param {(success:boolean)=>void} callback 回调
   */
  contractJob(job_id, sign, callback) {
    connection.getConnection().query('UPDATE t_jobs SET status=? WHERE id=?', 
      [ sign ? 3 : 1, job_id ], (error, results, fields) => {
      if (error) { callback(false); logger.error('contractJob failed ! ', error); }
      else callback(true)
    });
  },
  /**
   * 删除工作
   * @param {number} job_id 工作id
   * @param {(success:boolean)=>void} callback 回调
   */
  deleteJob(job_id, callback) {
    connection.getConnection().query('SELECT status FROM t_jobs WHERE id = ' + job_id, (err, results) => {
      if(results && results.length > 0) {
        var status = results[0].status;
        connection.getConnection().query('UPDATE t_jobs SET status=? WHERE id=?', 
          [ status == 3 ? 5 : 4, job_id ], (error, results, fields) => {
          if (error) { callback(false); logger.error('deleteJob failed ! ', error); }
          else callback(true)
        });
      }else callback(false)
    })
    
  },
  /**
   * 彻底删除工作
   * @param {number} job_id 工作id
   * @param {(success:boolean)=>void} callback 回调
   */
  deleteJobReal(job_id, callback) {
    connection.getConnection().query('DELETE FROM t_jobs SET WHERE id=?', 
    [ job_id ], (error, results, fields) => {
      if (error) { callback(false); logger.error('deleteJobReal failed ! ', error); }
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