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
