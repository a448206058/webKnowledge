## One simple trick to optimize React re-renders

Without using React.memo, PureComponent, or shouldComponentUpdate

I was preparing a blog post on a subject related to React re-renders when I stumbled upon this little React gem of knowledge I think you'll really appreciate:

> If you give React the same element you gave it on the last render, it wont bother re-rendering that elemen.

After reading this blog post, Brooks Lybrand implemented this trick and this was the result:

> A little before and after optimization on a react component.
> I didn't use any memoization to accomplish this, yet I was able to go from a 13.4ms to a 3.6ms render.

> I also didn't do anything besides move code into an extra component, which ended up cutting out 27 lines of code.pic.twitter.com/xrUNOMUm5Y

Excited? Let's break it down with a simple contrived example and then talk about what practical application this has for you in your day-to-day apps.

```JavaScript
import * as React from 'react'
import ReactDOM from 'react-dom'

function Logger(props) {
  console.log(`${props.label} rendered`)
  return null // what is returned here is irrelevant ...
}

function Counter() {
  const [count, setCount] = React.useState(0)
  const increment = () => setCount(c => c + 1)
  return (
    <div>
      <button onClick={increment}>The count is {count}</button>
      <Logger label="counter" />
    </div>
  )
}

ReactDOM.render(<Counter />, document.getElementById('root'))
```
When that's run, "counter rendered" will be logged to the console initially,and each time the count is incremented, "counter rendered" will be logged to the console.This happens because when the button is clicked,state changes and React needs to get the new React elements to render based on that state change.When it gets those new elements,it renders and commits them to the DOM.