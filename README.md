# react-native-event-manager

The React Native Event Manager is a utility library designed to simplify event handling and management in React Native applications. It provides a centralized event management system that allows components to communicate efficiently through events.

## Installation

```sh
npm install react-native-event-manager
```

## Usage

The ComponentA checks for changes in the 'onUpdate' state
```js
import { useOnEvent } from 'react-native-event-manager'

function ComponentA(): JSX.Element {

  const [value, setValue] = useState(-1)
  
  useOnEvent('onUpdate', (newValue) => {
    setValue(newValue)
  })

  return(
    <Text>{value}</Text>
  )
}
```

The ComponentB notify a change to the 'onUpdate' state
```js
import { notifyEvent } from 'react-native-event-manager'

function ComponentB(): JSX.Element {

  const [count, setCount] = useState(0)

  const handlePress = () => {
    notifyEvent('onUpdate', count)
    setCount(count + 1)
  }

  return(
    <Button title='Send' onPress={handlePress}/>
  )
}
```

#### EventManager Class
constructor()

    Initializes the EventManager instance.

get()

    Retrieves the singleton instance of the EventManager.

getListener(index: number): EventListener<any> | undefined

    Retrieves a listener at the specified index.

getListenerCount(): number

    Returns the number of registered listeners.

removeAllListener(eventName: string | null): boolean

    Removes all listeners for the specified event name. If eventName is null, removes all listeners.

remove(listener: EventListener<any>): boolean

    Removes the specified listener from the event manager.

sync<V>(eventName: string): Promise<V | null>

    Returns a Promise that resolves with the value of the next occurrence of the specified event.

on<V>(eventName: string, callback: Callback<V>): EventListener<V>

    Subscribes a listener to the specified event. Returns the created EventListener.

once<V>(eventName: string, callback: Callback<V>): EventListener<V>

    Subscribes a listener to the specified event, automatically removing it after the first occurrence. Returns the created EventListener.

notify<V>(eventName: string, value?: V): void

    Notifies all listeners of the specified event with an optional value.

#### EventListener Class
constructor(eventManager: EventManager, name: string, callback: Callback<T>)

    Initializes an EventListener instance with the specified event manager, event name, and callback function.

remove()

    Removes the listener from the event manager.

update(value?: T)

    Notifies all registered callbacks with an optional value.

#### useOnEvent Function
useOnEvent(eventName: string, callback: Callback<any>)

    A React hook for subscribing to a specific event. Automatically removes the listener on component unmount.

#### useOnEvents Function
useOnEvents(observers: { [key: string]: Callback<any>; })

    A React hook for subscribing to multiple events specified in the observers object. Automatically removes all listeners on component unmount.

#### notifyEvent Function
notifyEvent<V>(eventName: string, value?: V): void

    Notifies all listeners of the specified event with an optional value.


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
