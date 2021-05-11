## Writing Type-Safe Polymorphic React Components(Without Crashing TypeScript)
## 编写类型安全的多态react组件（不会导致typescript崩溃）

When designing a react component for reusability,you often need to be able to pass different DOM attributes to the component's container in different situations.Let's say you're building a <Button />.At first, you just need to allow a custom className to be merged in,but later, you need to support a wide range of attributes and event handlers that aren't related to the component itself,but rather the context in which it's used——say, aria-describedby when composed with a Tooltip component,or tabIndex and onKeyDown when contained in a component that manages focus with arrow keys.
在设计React组件以实现可重用性时，您通常需要能够在不同情况下将不同的DOM属性传递给组件的容器。假设您正在构建<Button />。刚开始时，您只需要允许className合并一个自定义项，但是随后，您需要支持与该组件本身无关，而是与它所使用的上下文无关的各种属性和事件处理程序。aria-describedby当与工具提示部件组成，或tabIndex与onKeyDown包含在管理焦点与箭头键的组分时。

It's impossible for Button to predict and to handle every special context where it might be used,so there's a reasonable argument for allowing arbitrary extra props to be passed to Button, and letting it pass extra ones it doesn't understand through.
Button无法预测和处理可能使用它的每个特殊上下文，因此有一个合理的论据允许将任意额外组件传递给Button，并让它传递它无法理解的额外组件。

```JavaScript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ColorName;
  icon?: IconName;
}

function Button({color, icon, className, children, ...props}: ButtonProps) {
  return (
    <button
      {...props}
      className={getClassName(color, className)}
    >
      <FlexContainer>
        {icon && <Icon name={icon} />}
        <div>{children}</div>
      </FlexContainer>
    </button>
  )
}
```

Awesome: we can now pass extra props to the underlying<button>element, and it's perfectly type-checked too.Since the props type extends React.ButtonHTMLAttributes,we can pass only props that are actually valid to end up on a <button>:
```JavaScript
<Button onKeyDown={({currentTarget}) => { /* do something */ }}>
<Button foo="bar" /> // Correctly errors
```

### When passthrough isn't enough
Half an hour after you send Button v1 to the product engineering team, they come back to you with a question: how do we use Button as a react-router Link? How about as an HTMLAnchorElement, a link to an external site?The component you sent them only renders as an HTMLButtonElement.

If we weren't concerned about type safety, we could write this pretty easily in plain JavaScript:
```JavaScript
function Button({
  color,
  icon,
  className,
  childre,
  tagName: TagName,
  ...props
}) {
  return (
    <TagName
      {...props}
      className={getClassName(color, className)}
    >
      <FlexContainer>
        {icon && <Icon name={icon} />}
        <div>{children}</div>
      </FlexContainer>
    </TagName>
  )
}
Button.defaultProps = {tagName: 'button'};
```
This makes it trivial for a consumer to use whatever tag or component they like as the container:
```JavaScript
<Button tagName="a" href="https://github.com">GitHub</Button>
<Button tagName={Link} to="/about">About</Button>
```
But,how do we type this correctly?Button's props can no longer unconditionally extend React.ButtonHTMLAttributes, because the extra props might not be passed to a <button>.

Fair warning: I’m going to go down a serious rabbit hole to explain several reasons why this doesn’t work well. If you’d rather just take my word for it, feel free to jump ahead to a better solution.

Let's start with a slightly simpler case where we only need to allow tagName to be 'a' or 'button'.(I'll also remove props and elements that aren't relevant to the point for brevity.)This would be a reasonable attempt:
```JavaScript
interface ButtonProps {
  tagName: 'a' | 'button';
}

function Button<P extends ButtonProps>({tagName: TagName, ...props}: P & JSX.IntrinsicElements[P['tagName']]){
  return <TagName {...props} />;
}

<Button tagName="a" href="/" />
```

N.B. To