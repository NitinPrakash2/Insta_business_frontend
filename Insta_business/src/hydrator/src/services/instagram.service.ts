import { call } from './api'
import type { InstagramStatus } from '../types'

export const instagramService = {
  getStatus:      ()                        => call<InstagramStatus>('meta_connection_status'),
  validate:       ()                        => call('instagram_validate'),
  startOAuth:     (redirect_uri: string)    => call('meta_oauth_start', { redirect_uri }),
  oauthCallback:  (code: string, redirect_uri: string) => call('meta_oauth_callback', { code, redirect_uri }),
  connect:        (access_token: string)    => call('instagram_connect', { access_token }),
  disconnect:     ()                        => call('meta_disconnect'),
  getCatalogDetails: ()                     => call('instagram_catalog_details'),
  getHealth:      ()                        => call('instagram_health'),
}
