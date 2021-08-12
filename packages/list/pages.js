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
