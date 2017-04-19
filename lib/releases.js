'use strict'

module.exports = {
  FindRelease: function (heroku, app, search) {
    return heroku.request({
      path: `/apps/${app}/releases`,
      partial: true,
      headers: { 'Range': 'version ..; max=10, order=desc' }
    }).then(search)
  }
}
