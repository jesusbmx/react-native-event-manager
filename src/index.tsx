import { useEffect } from "react";

/**
 * Control de mensajes
 */
export class EventManager {
  private static _instance: EventManager;
    
  private listeners = new Array<EventListener<any>>();
    
  constructor() {
    //console.info("EventManager", "init")
  }

  public static get() {
    return this._instance || (this._instance = new this());
  }

  /**
   * Obtiene un listener por su posicion
   * @param index
   * @return 
   */
  getListener(index: number): EventListener<any> | undefined {
    return this.listeners[index];
  }

  /**
   * Obtiene el numero de listeners registrados
   * @return 
   */
  getListenerCount(): number {
    return this.listeners.length;
  }
    
  /**
   * Elimina los listener segun su nombre
   * @param eventName 
   * @returns 
   */
  removeAllListener(eventName: string | null): boolean {
    //console.info("EventManager", "removeAllListener", eventName)

    if (eventName == null) {
      this.listeners = new Array<EventListener<any>>()
      return true;
    }

    var i = 0;
    while (i < this.listeners.length) {
      const listener: EventListener<any> | undefined = this.listeners[i];
      if (listener && listener.name == eventName) {
        this.listeners.slice(i, 1)
      } else {
        i++;
      }
    }

    return false;
  }

  /**
   * Remueve el listener de este puente
   * 
   * @param listener unsubscribe
   * @return 
   */
  remove(listener: EventListener<any>): boolean {
    //console.info("EventManager", "remove", listener.name)

    const index = this.listeners.indexOf(listener);
    if (index != -1) { // only splice array when item is found
      this.listeners.splice(index, 1); // 2nd parameter means remove one item only
      return true;
    }
    return false;
  }

  /**
   * Obtiene una Promise de un once
   * @param <V>
   * @param listenerName
   * @return 
   */
  sync<V>(eventName: string): Promise<V | null> {
    const manager: EventManager = this;

    return new Promise<V | null>((resolve, reject) => {
      manager.once<V>(eventName, (value?: V) => {
        try {
          if (value == null) {
            resolve(null)
          } else {
            resolve(value)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }
    
  /**
   * subscribe un listener a este manager
   * 
   * @param <V>
   * @param eventName nombre del evento
   * @param callback escucha cuando se envie un nuevo mensaje
   * @return subscribe
   */
  on<V>(eventName: string, callback: Callback<V>): EventListener<V> {
    //console.info("EventManager", "on", eventName)
    const listener = new EventListener<V>(this, eventName, callback);
    this.listeners.push(listener);
    return listener;
  }

  /**
   * subscribe un listener. La próxima vez que se active, este agente de 
   * escucha se elimina.
   * 
   * @param <V>
   * @param eventName nombre del evento
   * @param callback escucha cuando se envie un nuevo mensaje
   * @return subscribe
   */
  once<V>(eventName: string, callback: Callback<V>): EventListener<V> {
    const listener = this.on(eventName, callback)
    listener.callbacks.push(() => {
      listener.remove()
    })
    return listener;
  }

  /**
   * Notifica la respuesta al EventListenr
   * @param <V>
   * @param eventName nombre del listener
   * @param value valor que se mandara
   */
  notify<V>(eventName: string, value?: V) {
    //console.info("EventManager", "notify", eventName)
    for (var i = 0; i < this.listeners.length; i++) {
      const listener: EventListener<any> | undefined = this.listeners[i];
      
      if (listener && listener.name == eventName) {
        if (value) {
          listener.update(value);
        } else {
          listener.update();
        }
      }
    }
  }  
}

/**
 * Evento que se llamara al enviar el mensaje
 */
export type Callback<T> = (value?: T) => void;

/**
 * Evento registrado par el watcher
 */
export class EventListener<T> {

  public eventManager: EventManager;
  public name: string;
  public callbacks = new Array<Callback<T>>();

  constructor(
    eventManager: EventManager, 
    name: string, 
    callback: Callback<T>
  ) {
    this.eventManager = eventManager;
    this.name = name;
    this.callbacks.push(callback);
  }

  remove() {
    //console.info("EventListener", "remove")
    this.eventManager.remove(this);
  }

  update(value?: T) {
    //console.info("EventListener", "update", value)

    for (var i = 0; i < this.callbacks.length; i++) {
      const callback = this.callbacks[i];
      if (callback) {
        callback(value);
      }
    }
  }
}


/**
 * Hook para crear watcher
 * @param eventName nombre del evento
 * @param callback cuando se notifique algo
 */
export const useOnEvent = (
  eventName: string, callback: Callback<any>
) => {

  const eventManager = EventManager.get()
  
  useEffect(() => {
    const listener: EventListener<any> = 
      eventManager.on(eventName, callback)

    return () => {
      listener.remove()
    }
  }, [])

}

/**
 * Hook para crear varios watcher
 * @param observers 
 */
export const useOnEvents = (
 observers: { [key: string]: Callback<any>; }
) => {

  const eventManager = EventManager.get()
  
  useEffect(() => {
    var listeners = Array<EventListener<any>>()

    // subscribe
    for (var eventName in observers) {
      const callback: Callback<any> | undefined = observers[eventName]
      if (callback) {
        listeners.push(eventManager.on(eventName, callback))
      }
    }

    return () => {
      // unsubscribe
      listeners.forEach((element: EventListener<any>) => {
        element.remove()
      });
    }

  }, [])
}

export function notifyEvent<V>(eventName: string, value?: V) {
  EventManager.get().notify(eventName, value)
}
