## 前言
之前聊过`Webpack5`提供的`ModuleFederation`，以及深入探讨了一下它的可能性，有小伙伴问我，这就是微前端吗，看起来好复杂。Emm，通过`ModuleFederation`确实可以很轻松地实现微前端开发，但微前端的实现可以不借助工具，今天我们就抛开`Webpack`，来谈谈微前端。

## 什么是微前端？

微前端是一种多个团队通过独立发布功能的方式来共同构建现代化web应用的手段及方法策略。每个团队可以使用自己喜欢的技术栈，独立开发，独立部署，还可以实现增量升级。

通过这里的描述我们可以发现，微前端更多的是一种偏向于软件开发管理的概念，在这个策略下，我们调整我们的组织结构，划分多个小团队，把每个团队的开发任务限制在一个小范畴里面，彼此独立互不干扰，
由此可以并行开发，同时进行多个业务的扩展，这提高了迭代速度。而且这个开发形式的变动对用户来说是无感知的，最后到达用户手中的还会是一个完整的app。这涉及到要把各个团队的开发成果组装起来，我们可以借助`超链接`、`iframe`、`SSR`以及其它一些技术来完成。

有小伙伴可能会疑惑，我们之前的开发中就会把模块拆分成更多更小粒度的任务来完成，有啥不一样吗？它拆分团队来开发独立的app，最后又要组装到一起，费这样的劲有什么好处？微前端的特殊点在于独立与控制权。了解过`微服务`的小伙伴可能更能体会这一点，其它小伙伴也别急，下面我们还是通过一个实际的例子来感受下这个理念的实践。

## 练两下？
假设现在我们需要做一个博客应用，它初期需要实现文章列表、文章详情以及推荐文章这三个功能。成员们经过讨论一致决定先快速迭代一个版本出来，采用微前端的模式，三个功能并行开发，据此划分三个团队出来，团队A实现文章列表，团队B实现文章详情，团队C实现文章推荐。（我们这儿团队划分的方式其实有点不合理，文章列表跟文章详情属于同一个业务范畴，但是为了栗子尽可能简单同时把概念阐述清楚，我们先这么分。）

A团队率先实现了他们的功能，提供了一个可以展示文章列表的app，然后把它部署在他们自己的服务器上，用户可以直接使用这个app来直接浏览现有的博客列表啦：

```
class ArticleListPage extends HTMLElement {
    connectedCallback() {
        console.log("ArticleListPage页面 connectedCallback");
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
      <h1>大家好~</h1>
      <strong>这是文章列表：</strong>
      <ul>
        <li><a href="/article/webpack">webpack原理分析</a></li>
        <li><a href="/article/mf">微前端从入门到放弃</a></li>
        <li><a href="/article/react">react大法好</a></li>
      </ul>
    `;
    }
}

window.customElements.define("article-list-page", ArticleListPage);
```
这边的app可以是一个复杂的spa，也可以是简单的几个页面。我们为了让例子尽可能简单，没有使用框架，使用了`Web Component`。`Web Component`是近两年提出来的新标准，可以实现组件化开发，而且`React`、`Vue`等框架也提供了与`Web Component`兼容的方案，我们可以使用`Web Component`来写一些胶水代码。此外`Web Component`也提供了一些生命周期函数方便我们做一些操作，（比如这边的`connectedCallback`）大家感兴趣的可以多多了解一下。我们这边也没有涉及后端调用，写死了一些数据。此外我们还用到了`Shadow Dom`，主要用来做隔离，避免不同微前端app集成到一起时产生样式冲突之类的问题。

光有文章列表可不行，好在几乎同一时间B团队部署了它们的文章详情app：
```
const template = article => {
    return `
        <a href="/">首页</a> -
        <a href="/recommendation">更多文章推荐</a>
        <h1>${article.name}</h1>
        <span>${article.content} </span>
                `;
};

class WebpackArticle extends HTMLElement {
    connectedCallback() {
        this.innerHTML = template({name: "webpack", content: "webpack"});
    }
}
window.customElements.define(
    "webpack-article",
    WebpackArticle
);

class ReactArticle extends HTMLElement {
    connectedCallback() {
        this.innerHTML = template( {name: "react", content: "react"});
    }
}
window.customElements.define(
    "react-article",
    ReactArticle
);

class MfArticle extends HTMLElement {
    connectedCallback() {
        this.innerHTML = template({name: "micro-frontend", content: "micro-frontend"});
    }
}
window.customElements.define(
    "mf-article",
    MfArticle
);
```

正常情况这儿得实现一个通用的组件，然后在组件挂载后向后台请求数据，我们这边也是就写死一些数据了。现在两个团队的app可以通过事先约定的定义URL的一些规则互相跳转啦：

别忘了文章顶部还有个`更多文章推荐`按钮，通过它我们可以进入到推荐页面：

```
class RecommendationArticlePage extends HTMLElement {
    connectedCallback() {
        console.log("RecommendationArticlePage页面 connectedCallback");
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
      <h1>读者好~</h1>
       <a href="/">首页</a>
      <span>这是推荐的文章列表：</span>
      <ul>
        <li><a href="/article/webpack">webpack原理分析</a></li>
        <li><a href="/article/mf">微前端从入门到放弃</a></li>
        <li><a href="/article/react">react大法好</a></li>
      </ul>
    `;
    }
}

window.customElements.define("recommendation-article-page", RecommendationArticlePage);
```

现在各个团队都把他们负责的业务实现出来了，并各自部署自己的服务器上。由于他们可以选择自己喜欢的技术栈，（比如推荐系统可能会涉及到机器学习它们的后端可能就直接选择熟悉的python来实现了）他们也可以选择自己喜欢的云平台来部署，甚至让每个app拥有独立的域名。由于彼此都独立部署，即便推荐系统崩溃了，也不影响其它app正常使用。

这个过程中微前端开发的优势就显示出来了，如果团队现在发现系统公测时得有个发布文章的功能才行啊，基于现在的开发模型，那只要增加一个团队负责相关功能就好了，并不会影响其它团队的进度。而且因为每个团队都专注于一个小目标，后期如果需要切换技术栈，重构甚至重写的成本也大大降低，有新人加入时能够更快地融入团队。这也回答了我们上面有关微前端开发的疑问。

一切准备就绪，我们需要把这些app组合起来，让用户有完整丝滑的体验。其实在某种程度上来说这些app已经互相关联起来了，每当用户要从一个业务场景进入到另一个业务场景时，点击页面中的超链接，打开了下一个页面，这就已经完成了业务场景的切换。可能用户看到地址栏里不同页面使用了不同的域名会觉得奇怪，我们可以用`nginx`设置一个代理，配置通过一个统一的域名来访问，然后根据不同的路由把请求转发给某个负责这方面业务的app。需要注意的是，这种做法又跟微前端的去中心化的理念有些相违背，可能会出现底层的每个app都还在运行但是代理挂了的情况，这种情况用户就没办法使用app了。而且在这个spa横行的时代，要打开许多窗口有点显得格格不入。

那在多个app间实现类似的路由也不是不可以嘛，最直接的想法就是监听URL变更来动态展示不同的内容。

## 额，每个页面一个窗口确实有点糟

说干就干，这边我们使用`history`这个库来实现监听URL的功能，我们熟悉的`React Router`也是基于这个库来实现对URL的监听的。

新建一个html，将其作为放置其它微前端app的一个壳，先在其中放入一个div,在我们想要展示集成过来的微前端app的地方占个坑~这个页面在运行时会把其它app的代码从它们的服务器加载进来。

```
<div id="app-content"></div>
```

然后创建监听路由变化的history对象：

```
window.appHistory = HistoryLibrary.createBrowserHistory();
```
之后是配置路由跟对应组件的映射关系：

```
const routes = {
    "/article/webpack": "webpack-article",
    "/article/mf": "mf-article",
    "/article/react": "react-article",
    "/recommendation": "recommendation-article-page",
    "/": "article-list-page",
};
```
这样当路由切换时，我们就可以根据路由判断该展示什么微前端app啦！映射关系配置好了，接下来我们要设置路由发生改变时的回调，替换各个app：

```
const findComponentByPath = (pathname) => {
    return routes[pathname];
}

const updateContent = ({location}) => {
    const next = findComponentByPath(location.pathname);
    const current = appContent.firstChild;
    if (current.nodeName.toLowerCase() !== next) {
        const newComponent = document.createElement(next);
        appContent.replaceChild(newComponent, current);
    }
}

window.appHistory.listen(updateContent);
```
最后别忘了拦截全局对超链接的点击事件，避免打开新页面：
```
document.addEventListener("click", e => {
    console.log("app-shell拦截到超链接的点击事件");
    if (e.target.nodeName === "A") {
        const href = e.target.getAttribute("href");
        window.appHistory.push(href);
        e.preventDefault();
    }
});
```

拦截了超链接上的点击事件后，根据URL对当前页面里的内容做替换，现在整个体验就好很多了，我们在同一个窗口里面实现状态的流转，不过目前的做法耦合性很高，不符合微前端去中心化的理念，“壳”需要知道每个应用包含的每个页面对应的地址，我们每发布一个页面都要通知这个“壳”配置一下它的路由，这会导致“壳”重新发布，产生了依赖关系，这样根本做不到独立发布独立部署。

## 类SPA的路由方式

来复盘一下，我们每个微前端app都是可以有自己的路由的，（比如由`React`实现的微前端app会有它的`React Router`来处理具体页面的跳转）对于一个已经采用了spa技术的app，根本不需要我们再处理路由。我们真正需要做的其实是，从一个团队的业务场景流转到另一个团队的业务场景时，过渡能不能像spa一样顺滑。这个逻辑简化下来，我们的“壳”现在只要判断哪个URL前缀该转发给哪个app来处理就好了，如果这个微前端app已经展示在页面上了，那不动，它的路由系统会处理一切。如果对应的微前端app不在页面上，那我们就把它替换到页面上来。

现在我们的“壳”的任务就减轻了，除非我们现在新增了一个开发团队开发了其它app，不然是不用再修改“壳”并重新部署的，而在每个app内，它新增多少个页面都不用通知别人，在自己的业务范围内可以自由部署。

```
window.appHistory = HistoryLibrary.createBrowserHistory();

const appContent = document.querySelector("#app-content");

const routes = {
    "/article/": "article-page",
    "/recommendation": "recommendation-article-page",
    "/": "article-list-page",
};

const findComponentByPath = (pathname) => {
    const prefix = Object.keys(routes).find(key =>
        pathname.startsWith(key)
    );
    return routes[prefix];
}

const updateContent = ({location}) => {
    const next = findComponentByPath(location.pathname);
    const current = appContent.firstChild;
    if (current.nodeName.toLowerCase() !== next) {
        console.log("app-shell内部使用的微前端页面变了");
        console.log("顶层路由改变");
        const newComponent = document.createElement(next);
        appContent.replaceChild(newComponent, current);
    } else {
        console.log("app-shell内部使用的微前端页面不变");
    }
}

window.appHistory.listen(updateContent);

updateContent({location: window.location});

document.addEventListener("click", e => {
    console.log("app-shell拦截到超链接的点击事件");
    if (e.target.nodeName === "A") {
        const href = e.target.getAttribute("href");
        window.appHistory.push(href);
        e.preventDefault();
    }
});
```
现在我们的“壳”只在URL变更时，通过前缀判断该切哪个微前端app了。具体要展示哪个页面，则交由对应的微前端app来处理。由于我们这边没有使用框架，为了模拟spa内路由的行为，我们可以在`Web Component`内部做一些监听。

```
const articles = {
    webpack: {name: "webpack", content: "webpack"},
    mf: {name: "micro-frontend", content: "micro-frontend"},
    react: {name: "react", content: "react"}
};

class ArticlePage extends HTMLElement {
    connectedCallback() {
        console.log("ArticlePage页面 connectedCallback");
        this.render(window.location);
        this.unlisten = window.appHistory.listen(({location}) => {
                this.render(location)
            }
        )
    }

    render(location) {
        console.log("路由变了 (二级路由 / article)");
        const match = location.pathname.match("/article/(.*)");
        const article = match && articles[match[1]];
        if (article) {
            this.attachShadow({mode: "open"});
            this.shadowRoot.innerHTML = `
        <a href="/">首页</a> -
        <a href="/recommendation">更多文章推荐</a>
        <h1>${article.name}</h1>
        <span>${article.content} </span>
                `;
        }
    }

    disconnectedCallback() {
        this.unlisten();
    }
}

window.customElements.define("article-page", ArticlePage);
```
这边把三个单独的文章组件换成了一个更加通用的文章页面组件，它会根据路由展示正确的内容。

好啦，现在我们的应用看起来跟一个正常开发的spa没有两样，就很nice是不是~ 而且注意观察，我们的实现也没有限制每个集成过来的app必须要使用什么框架，只要它提供一个实现好的`Web Component`就好了，这是我们定下的协议，而这对于现代前端框架来说不是什么难事~

这也是大部分微前端框架的实现原理，大家这时候来看`qiankun`的注册代码：
```
registerMicroApps([
  {
    name: 'react app', // app name registered
    entry: '//localhost:7100',
    container: '#yourContainer',
    activeRule: '/yourActiveRule',
  },
  {
    name: 'vue app',
    entry: { scripts: ['//localhost:7100/main.js'] },
    container: '#yourContainer2',
    activeRule: '/yourActiveRule2',
  },
]);


start();
```
或者`single-spa`的注册代码：
```
singleSpa.registerApplication(
  'appName',
  () => System.import('appName'),
  location => location.pathname.startsWith('appName'),
);
```
我们可以发现很多共性：
1. 我们通过`Web Component`的生命周期作为协议来做一些处理，而这些框架也提供了一套机制来正确地处理加载行为（比如`single-spa`提供了一些列的`single-spa-*`工具包来处理一些加载时机）。
2. 这些框架也都需要一个标签的id（一般标签都用div），用来把集成来的微前端app附加到页面里去，
3. 也要指定注册的微前端app跟哪些路由有映射关系。
这些框架在此基础上，做了更多的优化，能够支持按需加载等等。了解这底层藏着的基本原理之后，相信大家以后不管使用哪个微前端框架都能得心应手。

## 写在最后

到这儿想必大家也都发现了，这其中并没有什么花哨新奇的黑科技，都是在已有技术的基础上转变思路去完成的这套开发模式。今天就到这里啦，希望这篇文章能让大家对微前端有进一步的认识，欢迎一起来交流~

[完整代码](https://github.com/zongyunfeng/app-shell-demo)
