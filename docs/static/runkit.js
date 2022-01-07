(function () {
  var componentName = 'rk-embed';

  function loadScript(src, onload) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = onload;
    document.head.appendChild(script);
  }

  loadScript('https://embed.runkit.com', function () {
    class RkEmbed extends HTMLElement {
      constructor() {
        super();

        const wrapper = document.createElement('div');
        wrapper.style = 'margin: 20pt';

        const source = this.textContent;

        this.textContent = '';

        const tempCodePlaceholder = document.createElement('pre');
        tempCodePlaceholder.textContent = source;

        window.RunKit.createNotebook({
          element: wrapper,
          source,
          onLoad: () => tempCodePlaceholder.remove()
        });

        this.appendChild(wrapper);
        this.appendChild(tempCodePlaceholder);
      }
    }

    customElements.define(componentName, RkEmbed);
  });

  window.runkitDocsify = function (hook) {
    const regex =
      /<pre v-pre data-lang="js\s*#runkit\s*"><code class="lang-js\s*#runkit\s*">(.*?)<\/code><\/pre>/gs;

    hook.afterEach((html, next) =>
      next(html.replace(regex, '<' + componentName + '>$1</' + componentName + '>'))
    );
  };
})();
