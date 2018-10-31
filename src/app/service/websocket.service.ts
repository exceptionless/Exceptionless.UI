import { Injectable } from '@angular/core';
import { AuthService } from 'ng2-ui-auth';
import { AppEventService } from './app-event.service';

declare var environment;

@Injectable({
    providedIn: 'root'
})
export class WebsocketService {

    _connection: any;
    _websocketTimeout: any;

    ResilientWebSocket = (function () {
        function ResilientWebSocket(url, protocols) {
            if (protocols === void 0) {
                protocols = [];
            }
            this.reconnectInterval = 1000;
            this.timeoutInterval = 2000;
            this.forcedClose = false;
            this.timedOut = false;
            this.protocols = [];
            this.onopen = function (event) { };
            this.onclose = function (event) { };
            this.onconnecting = function () { };
            this.onmessage = function (event) { };
            this.onerror = function (event) { };
            this.url = url;
            this.protocols = protocols;
            this.readyState = WebSocket.CONNECTING;
            this.connect(false);
        }
        ResilientWebSocket.prototype.connect = function (reconnectAttempt) {
            const _this = this;
            // this.ws = new WebSocket(this.url, this.protocols);
            this.ws = new WebSocket(this.url);
            this.onconnecting();
            const localWs = this.ws;
            const timeout = setTimeout(function () {
                _this.timedOut = true;
                localWs.close();
                _this.timedOut = false;
            }, this.timeoutInterval);
            this.ws.onopen = function (event) {
                clearTimeout(timeout);
                _this.readyState = WebSocket.OPEN;
                reconnectAttempt = false;
                _this.onopen(event);
            };
            this.ws.onclose = function (event) {
                clearTimeout(timeout);
                _this.ws = null;
                if (_this.forcedClose) {
                    _this.readyState = WebSocket.CLOSED;
                    _this.onclose(event);
                } else {
                    _this.readyState = WebSocket.CONNECTING;
                    _this.onconnecting();
                    if (!reconnectAttempt && !_this.timedOut) {
                        _this.onclose(event);
                    }
                    setTimeout(function () {
                        _this.connect(true);
                    }, _this.reconnectInterval);
                }
            };
            this.ws.onmessage = function (event) {
                _this.onmessage(event);
            };
            this.ws.onerror = function (event) {
                _this.onerror(event);
            };
        };
        ResilientWebSocket.prototype.send = function (data) {
            if (this.ws) {
                return this.ws.send(data);
            } else {
                throw new Error('INVALID_STATE_ERR : Pausing to reconnect websocket');
            }
        };
        ResilientWebSocket.prototype.close = function () {
            if (this.ws) {
                this.forcedClose = true;
                this.ws.close();
                return true;
            }
            return false;
        };
        ResilientWebSocket.prototype.refresh = function () {
            if (this.ws) {
                this.ws.close();
                return true;
            }
            return false;
        };
        return ResilientWebSocket;
    }());


    constructor(
        private appEvent: AppEventService,
        private authService: AuthService) {
    }

    getPushUrl() {
        const pushUrl = environment.BASE_URL + 'push?access_token=' + this.authService.getToken();
        const protoMatch = /^(https?):\/\//;
        if (environment.BASE_URL.startsWith('https:')) {
            return pushUrl.replace(protoMatch, 'wss://');
        }

        return pushUrl.replace(protoMatch, 'ws://');
    }

    startImpl() {
        this._connection = new this.ResilientWebSocket(this.getPushUrl(), null);
        this._connection.onmessage = (ev) => {
            const data = ev.data ? JSON.parse(ev.data) : null;
            if (!data || !data.type) {
                return;
            }

            if (data.message && data.message.change_type >= 0) {
                data.message.added = data.message.change_type === 0;
                data.message.updated = data.message.change_type === 1;
                data.message.deleted = data.message.change_type === 2;
            }

            console.log(data);

            this.appEvent.fireEvent({
                type: data.type,
                value: data.message
            });

            // This event is fired when a user is added or removed from an organization.
            if (data.type === 'UserMembershipChanged' && data.message && data.message.organization_id) {
                this.appEvent.fireEvent({
                    type: 'OrganizationChanged',
                    value: data.message
                });
                this.appEvent.fireEvent({
                    type: 'ProjectChanged',
                    value: data.message
                });
            }
        };
    }

    startDelayed(delay) {
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
