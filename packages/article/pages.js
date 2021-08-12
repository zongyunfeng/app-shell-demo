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
