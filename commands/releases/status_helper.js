'use strict'

function pendingDescription (release, runningRelease) {
  if (runningRelease !== undefined && runningRelease.id === release.id) {
    return 'release command executing'
  } else {
    return 'pending'
  }
}

module.exports.description = function (release, runningRelease) {
  switch (release.status) {
    case 'pending':
      return pendingDescription(release, runningRelease)
    case 'failed':
      return 'release command failed'
    default:
      return
  }
}

module.exports.color = function (s) {
  switch (s) {
    case 'pending':
      return 'yellow'
    case 'failed':
      return 'red'
    default:
      return 'white'
  }
}
