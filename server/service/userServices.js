const connection = require("../utils/database");
const logger = require("../utils/logger");

module.exports = {
  /**
   * 获取指定微信号是否已经在本数据库中存在
   * @param {string} weixin_openid 微信用户唯一标识
   * @param {(exists : boolean, id : number)=>void} callback 回调，存在则返回用户id，不存在则返回null
   */
  checkUserExistsByWeixinOpenId(weixin_openid, callback) {
    connection.getConnection().query('SELECT open_id,id FROM t_user WHERE open_id=?', [weixin_openid], (error, results, fields) => {
      if (error) { callback(false, null); logger.error('checkUserExistsByWeixinOpenId failed ! ', error); }
      else if (results && results.length > 0) callback(true, results[0].id)
      else callback(false, null)
    });
  },
  /**
   * 添加用户
   * @param {string} weixin_openid 微信用户唯一标识
   * @param {(success : boolean, newId: number)=>void} callback
   */
  addUser(weixin_openid, callback) {
    connection.getConnection().query('INSERT INTO t_user(open_id) VALUES(?)', [weixin_openid], (error, results, fields) => {
      if (error) { callback(false, 0); logger.error('addUser failed ! ', error); }
      else callback(true, results.insertId)
    });
  },
  /**
   * 获取用户信息数据
   * @param {number} uid 用户 id
   * @param {(data : any)=>void} callback 回调
   */
  getUserInfo(uid, callback) {
    connection.getConnection().query('SELECT address,name,phone,age,introd,edulevel FROM t_user WHERE id=?', [uid], (error, results, fields) => {
      if (error) { callback(null); logger.error('getUserInfo failed ! ', error); }
      else if(results && results.length > 0) callback(results[0])
      else callback(null)
    });
  },
  /**
   * 更新用户信息数据
   * @param {number} uid 用户 id
   * @param {(success : boolean)=>void} callback 回调
   */
  updateUserInfo(uid, address,name,phone, age,introd,edulevel, callback) {
    connection.getConnection().query('UPDATE t_user SET address=?,name=?,phone=?,age=?,introd=?,edulevel=? WHERE id=?', 
      [ address, name, phone, age,introd,edulevel, uid ], (error, results, fields) => {
      if (error) { callback(false); logger.error('updateUserInfo failed ! ', error); }
      else callback(true)
    });
  },
}

