/* eslint-disable */

(function () {
  var componentName = 'rk-embed';

  function loadScript(src, onload) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = onload;
    document.head.appendChild(script);
  }

  function createTemporaryCodeblock(textCode) {
    const element = document.createElement('pre');
    element.setAttribute('v-pre', true);
    element.setAttribute('data-lang', 'js');

    const code = document.createElement('code');
    code.classList.add('lang-js');
    code.textContent = textCode;

    element.appendChild(code);

    return element;
  }

  loadScript('https://embed.runkit.com', function () {
    class RkEmbed extends HTMLElement {
      constructor() {
        super();

        const textContent = this.textContent;
        this.textContent = '';

        const temporary = createTemporaryCodeblock(textContent);

        window.RunKit.createNotebook({
          element: this,
          source: textContent,
          mode: this.getAttribute('endpoint') ? 'endpoint' : 'default',
          onLoad: () => temporary.remove()
        });

        this.appendChild(temporary);
      }
    }

    customElements.define(componentName, RkEmbed);
  });

  window.runkitDocsify = function (hook) {
    const regex =
      /<pre v-pre data-lang="js\s*#runkit\s*(endpoint)?\s*"><code class="lang-js\s*#runkit\s*(endpoint)?\s*">(.*?)<\/code><\/pre>/gs;

    hook.afterEach((html, next) =>
      next(
        html.replace(regex, '<' + componentName + ' $1="$2">$3</' + componentName + '>')
      )
    );
  };
})();
