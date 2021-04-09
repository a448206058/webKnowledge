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
The second argument can be used to define all the variables (allocated in this array) on which the hook depends.If one of the variables changes,the hook runs again.If the array with variables is empty, the hook doesn't run when updating the component at all,because it doesn't have to watch any variables.
第二个参数可用于定义钩子依赖的所有变量（在该数组中分配）。如果其中一个变量发生变化，钩子将再次运行。如果带有变量的数组是空的，那么钩子在更新组件时根本不会运行，因为它不必监听任何变量。

There is one last catch.In the code, we are using async/await to fetch data from a third-party API.According to the documentation every function annotated with async returns an implicit promise:"The async function declaration defines an asynchronous function,which returns an AsyncFunction object.An asynchronous function is a function which operates asynchronously via the event loop,using an implicit Promise to return its result.".However, an effect hook should return nothing or a clean up function.That's why you may see the following warning in your developer console log:07:41:22.910 index.js:1452 Warning:useEffect function must return a cleanup function or nothing.Promises and useEffect(async () => ...)are not supported,but you can call an async function inside an effect.That's why using async directly in the useEffect function isn't allowed.Let's implement a workaround fot it,by using the async function inside the effect.
还有最后一个要点。在代码中，我们用async/await从第三方API获取数据。根据文档，用async标记的每个函数都会返回一个隐式的Promise:"异步函数声明定义了一个异步函数，它返回一个异步函数对象。一个异步函数是通过事件循环异步操作的函数，使用隐式promise返回结果。“然而，一个effect钩子应该不返回任何内容或者清除函数。这就是为什么你可能会在开发人员控制台看到打印07:41:22.910 index.js:1452警告：useEffect函数必须返回清除函数或空。promise 和 useEffect(async() => ...)是不被支持的，但是你可以在一个effect中调用异步函数。这就是为什么不允许在useEffect函数中直接async.让我们通过在effect中使用async函数来实现一个解决办法。
```JavaScript
import React, {useState, useEffect} from 'react'
import axios from 'axios';

function App() {
    const [data, setData] = useState({ hits: [] });

    useEffect(async () => {
        const fetchData = async () => {
            const result = await axios(
            'https://hn.algolia.com/api/v1/search?query=redux',
            );
            setData(result.data);
        };
        fetchData();
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
That's data fetching with React hooks in a nutshell.But continue reading if you are interested about error handling, loading indicators,how to trigger the data fetching from a from a form,and how to implement a reusable data fetching hook.
简而言之，这就是用React钩子获取数据。但是如果你对错误处理、加载指示器、如何触发从表单中获取数据以及如何实现可重用数据获取挂钩感兴趣，请继续阅读。

### HOW TO TRIGGER A HOOK PROGRAMMATICALLY / MANUALLY?
如何用编程/手动方式触发钩子？
Great, we are fetching data once the component mounts.But what about using an input field to tell the API in which topic we are interested in?"Redux" is taken as default query.But what about topics about "React"?Let's implement an input element to enable someone to fetch other stories than"Redux" stories.Therefore,introduce a new state for the input element.
好的，我们正在获取组件挂载之后的数据。但是使用输入字段告诉API我们感兴趣的主题是什么呢？"Redux"作为默认查询。但是关于react的话题呢？让我们实现一个输入元素，使某人能够获取redux故事以外的其它故事。
```JavaScript
import React, {Fragment, useState, useEffect} from 'react'
import axios from 'axios';

function App() {
    const [data, setData] = useState({hits: []});
    const [query, setQuery] = useState('redux');

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios(
                'https://hn.algolia.com/api/v1/search?query=redux',
            );

            setData(result.data);
        };

        fetchData();
    }, []);

    return (
        <Fragment>
            <input
                type="text"
                value={query}
                onChange={event => setQuery(event.target.value)}
            />
            <ul>
                {data.hits.map(item=> (
                    <li key={item.objectID}>
                        <a href={item.url}>{item.title}</a>
                    </li>
                ))}
            </ul>
        </Fragment>
    );
}

export default App;
```
At the moment, both states are independent from each other,but now you want to couple them to only fetch articles that are specified by the query in the input field.With the following change,the component should fetch all articles by query term once it mounted.
目前，这俩个状态彼此独立，但现在你希望将它们耦合起来，以便只获取由输入中的查询指定的数据。在下面的更改中，组件应该在挂载后按查询项获取所有数据。
```JavaScript
function App() {
    const [data, setData] = useState({hits: []});
    const [query, setQuery] = useState('redux');

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios(
                `https://hn.algolia.com/api/v1/search?query=${query}`,
            );

            setData(result.data);
        };

        fetchData();
    }, []);

    return (
        <Fragment>
            <input
                type="text"
                value={query}
                onChange={event => setQuery(event.target.value)}
            />
            <ul>
                {data.hits.map(item=> (
                    <li key={item.objectID}>
                        <a href={item.url}>{item.title}</a>
                    </li>
                ))}
            </ul>
        </Fragment>
    );
}

export default App;
```
One piece is missing: When you try to type something into the input field,there is no other data fetching after the mounting triggered from the effect.That's because you have provided the empty array as second argument to the effect.The effect depends on no variables,so it is only triggered when the component mounts.However,now the effect should depend on the query.Once the query changes,the data request should fire again.
少了一块：当你视图在输入字段中插入一些内容时，没有其他的数据获取到在挂载效果器effect之后。这是因为你提供了空数组作为第二个参数。这种effect不依赖于任何变量，因此只在组件mounts挂载时才会触发。但是，现在effect应该取决于查询。一旦查询发生变化，数据请求就会再次触发。
```JavaScript
function App() {
    const [data, setData] = useState({hits: []});
    const [query, setQuery] = useState('redux');

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios(
                `https://hn.algolia.com/api/v1/search?query=${query}`,
            );

            setData(result.data);
        };

        fetchData();
    }, [query]);

    return (
        <Fragment>
            <input
                type="text"
                value={query}
                onChange={event => setQuery(event.target.value)}
            />
            <ul>
                {data.hits.map(item=> (
                    <li key={item.objectID}>
                        <a href={item.url}>{item.title}</a>
                    </li>
                ))}
            </ul>
        </Fragment>
    );
}

export default App;
`` 
The refetching of the data should work once you change the value in the input field.But that opens up another proble:On every character you type into the input field,the effect is triggered and executes another data fetching request.How about providing a button that triggers the request and therefore the hook manually?
 一旦您更改了输入字段中的值，数据中的重取就应该起作用。但这开启了另外一个问题：在每个输入字符中键入的字符，将触发效果并执行另一个数据获取请求。提供一个按钮来触发请求，从而手动触发钩子怎么样？
```JavaScript
function App() {
    const [data, setData] = useState({hits: []});
    const [query, setQuery] = useState('redux')
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios(
                `http://hn.algolia.com/api/v1/search?query=${query}`,
            );

            setData(result.data);
        };

        fetchData();
    }, [query]);

    return (
        <Fragment>
            <input 
                type="text"
                value={query}
                onChange={event => setQuery(event.target.value)}
            />
            <button type="button" onClick={() => setSearch(query)}>
                Search
            </button>

            <ul>
                {data.hits.map(item => (
                    <li key={item.objectID}>
                        <a href={item.url}>{item.title}</a>
                    </li>
                ))}
            </ul>
        </Fragment>
    )
}
```
Now, make the effect dependant on the search state rather than fluctuant query state that changes with every key stroke in the input field.Once the user clicks the button,the new search state is set and should trigger the effect hook kinda manually.
现在，effect取决于搜索的状态值而不是输入中每个改变值。一次用户点击按钮，新的搜索状态被设置，应该手动触发effect钩子。
```JavaScript
function App() {
    const [data, setData] = useState({hits: []})
    const [query, setQuery] = useState('redux');
    const [search, setSearch] = useState('redux');

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios(
                `http://hn.algolia.com/api/v1/search?query=${search}`
            );

            setData(result.data);
        };

        fetchData();

       
    }, [search]);
    return (
        ...
    );
}

export default App;
```
Also the initial state of the search state is set to the same state as the query state,because the component fetches data also on mount and therefore the result should mirror the value in the input field.However,having a similar query and search state is kinda confusing.Why not set the actual URL as state instead of the search state?
此外，搜索状态的初始状态设置为与查询状态相同的状态，因为组件也在挂载时获取数据，因此结果应该反应输入字段中的值。然而，有一个类似的查询和搜索状态是有点混乱。为什么不将实际的URL设置为state而不是搜索状态呢？
```JavaScript
function App() {
    const [data, setData] = useState({hits: []});
    const [query, setQuery] = useState('redux');
    const [url, setUrl] = useState(
        'https://hn.algolia.com/api/v1/search?query=redux',
    );

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios(url);

            setData(result.data);
        };

        fetchData();
    }, [url]);

    return (
        <Fragment>
            <input 
                type="text"
                valuue={query}
                onChange={event => setQuery(event.target.value)}
                />
            <button
                type="button"
                onClick={() =>
                    setUrl(`http://hn.algolia.com/api/v1/search?query=${query}`)
                }
            >
                Search
            </button>
            <ul>
                {data.hits.map(item=> (
                    <li key={item.objectID}>
                        <a href={item.url}>{item.title}</a>
                    </li>
                ))}
            </ul>
        </Fragment>
    );
}
```
That's if for the implicit programmatic data fetching with the effect hook.You can decide on which state the effect depends.Once you set this state on a click or in another side-effect,this effect will run again.In this case,if the URL state changes,the effect runs again to fetch stories from the API.
如果使用effect获取隐式编程数据。你可以决定效果取决于哪个状态。一旦你在点击或其它副作用中设置了这个状态，这个effect将再次运行。在这个案例中，如果URL状态改变，效果会再次运行以从API获取故事。

### LOADING INDICATOR WITH REACT HOOKS
React 钩子 等待指示器
Let's introduce a loading indicator to the data fetching.It's just another state that is manage by a state hook.The loading flag is used to render a loading indicator in the App component.
让我们为数据获取引入一个加载指示器。它只是另一个由状态钩子管理的状态。加载标志用于呈现应用程序组件中的加载指示符。
```JavaScript
import React, {Fragment, useState, useEffect} from 'react';
import axios from 'axios';

function App() {
    const [data, setData] = useState({hits: []});
    const [query, setQuery] = useState('redux');
    const [url, setUrl] = useState(
        'https://hn.algolia.com/api/v1/search?query=redux',
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            const result = await axios(url);

            setData(result.data);
            setIsLoading(false);
        };
        
        fetchData();
    }, [url]);

    return (
        <Fragment>
            <input 
                type="text"
                value={query}
                onChange={event => setQuery(event.target.value)}
            />
            <button
                type="button"
                onClick={() => 
                    setUrl(`http://hn.algolia.com/api/v1/search?query=${query}`)
                }
            >
                Search
            </button>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <ul>
                    {data.hits.map(item => (
                        <li key={item.objectID}>
                            <a href={item.url}>{item.title}</a>
                        </li>
                    ))}
                </ul>
            )}
        </Fragment>
    );
}

export default App;
```
Once the effect is called for data fetching,which happens when the component mounts or the URL state changes,the loading state is set to true.Once the request resolves,the loading state is set to false again.
一旦为数据获取调用了effect,当组件挂载或URL状态更改时发生这种情况，加载状态就设置为true。一旦请求解析，加载状态将再次设置为false.

### FETCHING DATA WITH FORMS AND REACT
表单获取数据

What about a proper form to fetch data? So far,we have only a combination of input field and button.Once you introduce more input elements,you may want to wrap them with a form element.In addition, a form makes it possible to trigger the button with "Enter" on the keyboard too.
用一个合适的表单来获取数据怎么样？到目前为止，我们只有输入字段和按钮的组合。一旦引入了更多的输入元素，你可能需要用一个表单元素来包装他们。此外，一个表单还可以通过键盘上的"回车"来触发按钮。
```JavaScript
function App() {
    ...
    return (
        <Fragment>
            <form
                onSubmit={() => 
                    setUrl(`http://hn.algolia.com/api/v1/search?query=${query}`)
                }
            >
                <input
                    type="text"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                />
                <button type="submit">Search</button>
            </form>
            {isError && <div>Something went wrong...</div>}
            ...
        </Fragment>
    )
}
```
But now the browser reloads when clicking the submit button,because that's the native behavior of the browser when submitting a form.In order to prevent the default behavior,we can invoke a function on the React event.That's how you do it in React class components too.





https://www.bilibili.com/video/BV1iV411b7L1