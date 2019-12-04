module.exports = {

  /**
   * 获取用户是否登录
   * @param {Request} req 
   */
  checkUserAuthed(req) {
    return (req.session && req.session.userid && req.session.userid > 0) ;
  },
  /**
   * 获取登录的用户 id
   * @param {Request} req 
   */
  getLoggedUserId(req) {
    return (req.session && req.session.userid && req.session.userid > 0) ? req.session.userid : 0;
  }
}