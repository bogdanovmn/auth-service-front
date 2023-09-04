import mitt from 'mitt'

export enum Event {
    logout = 'logoutEvent',
    login = 'loginEvent'
}

export const eventBus = mitt()