import { Injectable } from "@angular/core";
import { AuthService } from "ng2-ui-auth";
import { AppEventService } from "./app-event.service";
import { TypedMessage, PlanOverage, PlanChanged, SystemNotification, ReleaseNotification, UserMembershipChanged, EntityChanged } from "../models/messaging";

class ResilientWebSocket {
    public reconnectInterval: number = 1000;
    public timeoutInterval: number = 2000;
    public readyState: number;
    public url: string;

    private forcedClose: boolean = false;
    private timedOut: boolean = false;
    private protocols: string[] = [];
    private ws: WebSocket;

    public onopen: (ev: Event) => void = (event: Event) => { };
    public onclose: (ev: CloseEvent) => void = (event: CloseEvent) => { };
    public onconnecting: () => void = () => { };
    public onmessage: (ev: MessageEvent) => void = (event: MessageEvent) => { };
    public onerror: (ev: ErrorEvent) => void = (event: ErrorEvent) => { };

    constructor(url: string, protocols: string[] = []) {
      this.url = url;
      this.protocols = protocols;
      this.readyState = WebSocket.CONNECTING;
      this.connect(false);
    }

    public connect(reconnectAttempt?: boolean) {
      this.ws = new WebSocket(this.url, this.protocols);

      this.onconnecting();

      const localWs = this.ws;
      const timeout = setTimeout(() => {
        this.timedOut = true;
        localWs.close();
        this.timedOut = false;
      }, this.timeoutInterval);

      this.ws.onopen = (event: Event) => {
        clearTimeout(timeout);

        this.readyState = WebSocket.OPEN;
        reconnectAttempt = false;
        this.onopen(event);
      };

      this.ws.onclose = (event: CloseEvent) => {
        clearTimeout(timeout);
        this.ws = null;

        if (this.forcedClose) {
          this.readyState = WebSocket.CLOSED;
          this.onclose(event);
        } else {
          this.readyState = WebSocket.CONNECTING;
          this.onconnecting();
          if (!reconnectAttempt && !this.timedOut) {
            this.onclose(event);
          }
          setTimeout(() => {
            this.connect(true);
          }, this.reconnectInterval);
        }
      };
      this.ws.onmessage = (event) => {
        this.onmessage(event);
      };
      this.ws.onerror = (event: ErrorEvent) => {
        this.onerror(event);
      };
    }

    public send(data) {
      if (this.ws) {
        return this.ws.send(data);
      } else {
        throw new Error("INVALID_STATE_ERR : Pausing to reconnect websocket");
      }
    }

    public close(): boolean {
      if (this.ws) {
        this.forcedClose = true;
        this.ws.close();
        return true;
      }
      return false;
    }

    public refresh(): boolean {
      if (this.ws) {
        this.ws.close();
        return true;
      }
      return false;
    }
  }

@Injectable({
    providedIn: "root"
})
export class WebsocketService {
    private _connection: ResilientWebSocket;
    private _websocketTimeout;

    constructor(
        private appEvent: AppEventService,
        private authService: AuthService) {
    }

    getPushUrl() {
        const pushUrl = environment.BASE_URL + "/api/v2/push?access_token=" + this.authService.getToken();
        const protoMatch = /^(https?):\/\//;
        if (environment.BASE_URL.startsWith("https:")) {
            return pushUrl.replace(protoMatch, "wss://");
        }

        return pushUrl.replace(protoMatch, "ws://");
    }

    startImpl() {
        this._connection = new ResilientWebSocket(this.getPushUrl());
        this._connection.onmessage = (ev: MessageEvent) => {
            const data: TypedMessage = ev.data ? JSON.parse(ev.data) : null;
            if (!data || !data.type) {
                return;
            }

            switch (data.type) {
                case "PlanOverage":
                    this.appEvent.fireEvent({ type: data.type, message: data.message as PlanOverage });
                    break;
                case "PlanChanged":
                    this.appEvent.fireEvent({ type: data.type, message: data.message as PlanChanged });
                    break;
                case "SystemNotification":
                    this.appEvent.fireEvent({ type: data.type, message: data.message as SystemNotification });
                    break;
                case "ReleaseNotification":
                    this.appEvent.fireEvent({ type: data.type, message: data.message as ReleaseNotification });
                    break;
                case "UserMembershipChanged":
                    this.appEvent.fireEvent({ type: data.type, message: data.message as UserMembershipChanged });

                    const message = data.message as EntityChanged;
                    if (data.type === "UserMembershipChanged" && message && message.organization_id) {
                        this.appEvent.fireEvent({ type: "OrganizationChanged", message });
                        this.appEvent.fireEvent({ type: "ProjectChanged", message });
                    }

                    break;
                default:
                    if (data.type.endsWith("Changed")) {
                        this.appEvent.fireEvent({ type: data.type, message: data.message as EntityChanged });
                    }

                    break;
            }
        };
    }

    startDelayed(delay: number) {
        if (this._connection || this._websocketTimeout) {
            this.stop();
        }

        this._websocketTimeout = setTimeout(() => { this.startImpl(); }, delay || 1000);
    }

    stop() {
        if (this._websocketTimeout) {
            clearTimeout(this._websocketTimeout);
            this._websocketTimeout = null;
        }

        if (this._connection) {
            this._connection.close();
            this._connection = null;
        }
    }

    start() {
        this.startDelayed(1);
    }
}
