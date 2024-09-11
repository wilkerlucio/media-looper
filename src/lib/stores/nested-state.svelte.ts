type Path = any[]

type SetterNotification<T> = (snapshot: T, path: Path, prop: any, value: any) => any

export function stateProxy<T extends object>(data: T, setter: SetterNotification<T>, container: any = data, path: Path = []) {
  return new Proxy<T>(data, {
    get: function (target, prop, receiver) {
      const val = container[prop]

      return typeof val === 'object' ? stateProxy(data, setter, val, [...path, prop]) : val
    },

    set(target, prop, value) {
      container[prop] = value

      setter($state.snapshot(data) as T, path, prop, value)

      return true
    }
  })
}