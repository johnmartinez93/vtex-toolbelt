/* @flow */
import {Client} from '@vtex/api'

type Context = {
  context: Array<string>
}

type ListSettings = {
  oldVersion: string,
  context: Array<string>,
  since: string,
  service: string,
}

type ListFilesSettings = {
  prefix: string,
  context: Array<string>,
  nextMarker: string,
}

const data = data => data
const noTransforms = [data]

const endpoint = 'http://apps-engine.aws-us-east-1.vtex.io'
const routes = {
  Apps: (account: string, workspace: string) =>
    `/${account}/${workspace}/apps`,

  App: (account: string, workspace: string, app: string) =>
    `${routes.Apps(account, workspace)}/${app}`,

  Acknowledge: (account: string, workspace: string, app: string, service: string) =>
    `${routes.App(account, workspace, app)}/acknowledge/${service}`,

  Settings: (account: string, workspace: string, app: string) =>
    `${routes.App(account, workspace, app)}/settings`,

  Files: (account: string, workspace: string, app: string) =>
    `${routes.App(account, workspace, app)}/files`,

  File: (account: string, workspace: string, app: string, path: string) =>
    `${routes.Files(account, workspace, app)}/${path}`,

  DependencyMap: (account: string, workspace: string) =>
    `/${account}/${workspace}/dependencyMap`,
}

const contextQuery = (context?: Array<string>) => context ? context.join('/') : context

export default class AppEngineClient extends Client {
  constructor ({authToken, userAgent, accept = '', timeout}) {
    super(endpoint, {authToken, userAgent, accept, timeout})
  }

  installApp (account: string, workspace: string, descriptor: string) {
    return this.http.post(routes.Apps(account, workspace), descriptor)
  }

  uninstallApp (account: string, workspace: string, app: string) {
    return this.http.delete(routes.App(account, workspace, app))
  }

  acknowledgeApp (account: string, workspace: string, app: string, service: string) {
    return this.http.put(routes.Acknowledge(account, workspace, app, service))
  }

  getAppSettings (account: string, workspace: string, app: string, {context}: Context = {}) {
    const params = {context: contextQuery(context)}
    return this.http(
      routes.Settings(account, workspace, app),
      {params},
    )
  }

  updateAppSettings (account: string, workspace: string, app: string, settings: any, {context}: Context = {}) {
    const params = {context: contextQuery(context)}
    return this.http.put(
      routes.Settings(account, workspace, app),
      settings,
      {params},
    )
  }

  patchAppSettings (account: string, workspace: string, app: string, settings: any, {context}: Context = {}) {
    const params = {context: contextQuery(context)}
    return this.http.patch(
      routes.Settings(account, workspace, app),
      settings,
      {params},
    )
  }

  listApps (account: string, workspace: string, {oldVersion, context, since, service}: ListSettings = {}) {
    const params = {
      oldVersion,
      context: contextQuery(context),
      since,
      service,
    }
    return this.http(routes.Apps(account, workspace), {params})
  }

  listAppFiles (account: string, workspace: string, app: string, {prefix, context, nextMarker}: ListFilesSettings = {}) {
    const params = {
      prefix,
      context: contextQuery(context),
      marker: nextMarker,
    }
    return this.http(routes.Files(account, workspace, app), {params})
  }

  getAppFile (account: string, workspace: string, app: string, path: string, context: Array<string> = []) {
    const params = {context: contextQuery(context)}
    return this.http(routes.File(account, workspace, app, path), {params, transformResponse: noTransforms})
  }

  getApp (account: string, workspace: string, app: string, context: Array<string> = []) {
    const params = {context: contextQuery(context)}
    return this.http(routes.App(account, workspace, app), {params})
  }

  getDependencyMap (account: string, workspace: string, service: string) {
    const params = {service}
    return this.http(routes.DependencyMap(account, workspace), {params})
  }
}