import Promise from 'bluebird'
import { HttpTransport } from '~/utils/transport'
import { PermissionDeniedError, InvalidInvitationCodeError } from '~/utils/errors'
import config from '~/utils/config'


const API_URL = config.serverURL + '/api'
const SESSION_URL = '/sessions'
const CLIENT_URL = '/client'


export class CommonAPI {
  constructor () {
    this.transport = new HttpTransport()

    this.authToken = null
    this.userID = null
  }

  setTransport(transport) {
    this.transport = transport
  }

  authenticate (username, password) {
    return this.transport.post(
      API_URL + '/auth',
      {
        'username': username,
        'password': password
      }  
    )
    .then(response => response.data)
    .then(body => {
      this.userID = username
      return body
    })
  }
  
  getLastModificationTime (entity) {
    return this.transport.get(API_URL + '/meta/last_modification_date')
      .then(response => response.data)
      .then(text => new Date(text))
  }

  syncDatabase (entity, modifiedSince, limit = 10, offset = 0) {
    return this.transport.get(
      API_URL + `/${entity}?limit=${limit}&offset=${offset}&modified_since=${modifiedSince.toISOString()}`
    )
    .then(response => response.data)
  }

  getSessions () {
    return this.transport.get(
      API_URL + CLIENT_URL + '/' + this.userID + '/sessions?limit=50&status=1'
    ).then(r => r.data.results)
  }

  updateSessionStatus(sessionID, status) {
    return this.transport.put(
      API_URL + CLIENT_URL + '/' + this.userID + '/session/' + sessionID + '/status',
      {
        status: status
      }
    ).then(r => r.data.results)
  }
}

const API = new CommonAPI()
export default API
