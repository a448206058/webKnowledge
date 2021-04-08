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
这个App组件展示了一个用items循环的列表。state和state update函数来自于名为useState的state钩子，它负责管理我们将为App组件获取的数据的本地状态。初始状态是表示数据的对象中点击的空列表。还没有人为这些数据设置任何状态。

We are going to use axios to fetch data, but it is up to you to use another data fetching library or the native fetch API of the browser.If you haven't installed axios yet, you can do so by on the command line with npm install axios.Then implement your effect hook for the data fetching:
我们将使用axios来获取数据，但这取决于您是否使用另一个获取库或者浏览器的本地API获取。
如果您还没有安装axios，可以在命令行上使用npm install axios来安装。然后实现数据获取的effect钩子：
```JavaScript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [data, setData] = useState({ hits: []})

    useEffect(async() => {
        const result = await axios(
            'https://hn.algolia.com/api/v1/search?query=redux',
        );

        setData(result.data);
    });

    return (
        <ul>
            {data.hits.map(item => (
                <li key={item.objectID}>
                    <a href={item.url}>{item.title}</a>
                </li>
            ))}
        </ul>
    );
}

export default App;
```
The effect hook called useEffect is used to fetch the data with axios from the API and to set the data in the local state of the component with the state hook's update function.The promise resolving happens with async/await.
effect钩子用于使用axios从API获取数据，state钩子的update函数将数据设置为组件的本地状态。promsie解析使用async/await进行。

However, when you run your application, you should stumble into a nasty loop.The effect hooks runs when the component mounts but also when the component updates.Because we are setting the state after every data fetch, the component updates and the effect runs again.It fetches the data again an again.That's a bug and needs to be avoided.We only want to fetch data when the component mounts.That's why you can provide an empty array as second argument to the effect hook to avoid activating it on component updates but only for the mounting of the component.
然而，当你运行你的应用，你应该陷入一个讨厌的循环。effect hook运行在组件挂载时，也在组件更新时。因为我们正在设置每次数据获取后的状态，所以组件更新后会再次运行。它重复获取数据一次又一次。这是一个错误需要去避免。我们指向在组件挂载时获取数据。这就是为什么您可以提供一个空数组作为effect钩子的第二个参数，以避免在组件更新时激活它，而只在组件挂载的时候更新。
```JavaScript
import React, {useState, useEffect} from 'react'
import axios from 'axios';

function App() {
    const [data, setData] = useState({ hits: [] });

    useEffect(async () => {
        const result = await axios(
            'https://hn.algolia.com/api/v1/search?query=redux',
        );

        setData(result.data);
    }, []);

    return (
        <ul>
            {data.hits.map(item => (
                <li key={item.objectID}>
                    <a href={item.url}>{item.title}</a>
                </li>
            ))}
        </ul>
    );
}

export default App;
```
