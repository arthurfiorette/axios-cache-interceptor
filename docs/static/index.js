function editThisPage(_, vm) {
  var btn = document.getElementById('edit-this-page');
  btn.onclick = function (event) {
    event.preventDefault();
    window.open(
      'https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/docs/' +
        vm.route.file,
      '_blank'
    );
  };
}

window.$docsify = {
  name: 'Axios Cache Interceptor',

  coverpage: 'config/cover.md',
  loadSidebar: 'config/sidebar.md',
  notFoundPage: 'config/404.md',
  homepage: 'pages/homepage.md',

  themeColor: 'crimson',

  subMaxLevel: 2,

  // TODO: Test if this works with F5
  routerMode: 'history',

  basePath:'/axios-cache-interceptor/',

  search: 'auto',
  plugins: [editThisPage]
};
