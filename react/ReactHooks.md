## How to fetch data with React Hooks？
如何用React Hooks获取数据

In this turoial, I want to show you how to fetch data in React with Hooks by using the state and effect hooks.We will use the widely known Hacker News API to fetch popular articles from the tech world.You will also implement your custom hook for the data fetching that can be reused anywhere in your application or published on npm as standaloone node package.
在这篇文章中，我想向你展示如何用React中的钩子函数通过state和effect来获取数据。我们将使用广为人知的黑科技API从科技界获取热门文章。您还将实现用于数据获取的自定义钩子，这些钩子可以在应用程序中的任何位置重用，也可以作为单独的node包发布在npm上。

If you don't know anything about this new React feature, checkout this introduction to React Hooks.If you want to checkout the finished project for the showcased examples that show how to fetch data in React with Hooks, checkout this GitHub repository.
如果你对这个新的React功能一无所知，查看此介绍以了解React钩子。如果你想查看完成的项目来展示例子如何用React钩子函数获取数据，查看这个GitHub项目

If you just want to have a ready to go React Hook for data fetching:npm install use-data-api and follow the ducumentation.Don't forget to star it if you use it:-)
如果你只想有一个现成的React钩子函数去获取数据，用npm下载。别忘了给它加star

Not: In the future, React Hooks are not be intended for data fetching in React.Instead, a feature called Suspense will be in charge for it.The following walkthrough is noontheless a great way to learn more about state and effect hooks in React.
将来，React狗仔不用于在React中获取数据。取而代之的是一个叫Suspense的写法。下面的演练是了解React中的状态和效果挂钩的绝好方法。

### DATA FETCHING WITH REACT HOOKS
### 用REACT钩子函数获取数据

If you are not familiar with data fetching in React, checkout my extensive data fetching in React article.It walks you througn data fetching with React class components,how it can be made reusable with Render Prop Components and Higher-Order Components,and how it deals with error handling and loading spinners.In this article,I want to show you all of it with React Hooks in function components.
如果你不熟悉React中的数据获取，请查看我在React中的获取数据的文章。它引导您通过React类组件获取数据，如何使其与渲染属性组件和更高阶组件可重用，以及它如何处理错误和加载微调器。在本文中，wi想向你展示函数组件中的React钩子函数。
```JavaScript
import React, {useState} from 'react';
function App() {
    const [data, setData] = useState({hits: []});
    return (
        <ul>
            {data.hits.map(item => (
                <li key={item.objectID}>
                    <a href={item.url}>{item.title}</a>
                </li>
            ))}
        </ul>
    )
}

export default App;
```
The App component shows a list of items(hits = Hacker News articles).The state and state update function come from the state hook called useState that is responsible to manage the local state for the data that we are going to fetch for the App component. The initial state is an empty list of hits in an object that represents the data.No one is setting any state for this data yet.

