var github = (function(){
  var user,
      options,
      page      = 0,
      allRepos  = [];

  function render(target, repos){
    var i = 0,
        t = $(target)[0],
        fragment = '<li class="nav-header">GitHub Repos</li>';

    for(i = 0; i < repos.length; i++) {
      fragment += '<li><a href="'+repos[i].html_url+'">'+repos[i].name+'</a><p>'+repos[i].description+'</p></li>';
    }

    t.innerHTML = fragment;
  }

  function sortReposByDate(repos) {
    repos.sort(function(a, b) {
      var aDate = new Date(a.pushed_at).valueOf(),
          bDate = new Date(b.pushed_at).valueOf();

      if (aDate === bDate)
        return 0;

      return aDate > bDate ? -1 : 1;
    });

    return repos;
  }

  function mungeReposAndRender() {
    var repos = [];

    if (!allRepos)
      return;

    for (var i = 0; i < allRepos.length; i++) {
      if (options.skip_forks && allRepos[i].fork)
        continue;

      // Don't show changes to this blog, obviously.
      if (allRepos[i].name === options.user + ".github.com")
        continue;

      repos.push(allRepos[i]);
    }

    sortReposByDate(repos);

    if (options.count)
      repos.splice(options.count);

    render(options.target, repos);
  }

  function collectAllRepos(response) {
    if(response && typeof response.repositories !== undefined) {
      var repositories = response.repositories;

      if(repositories && repositories.length > 0) {
        allRepos = allRepos.concat(response.repositories);

        return callApiForPage(page++);
      }
    }

    return mungeReposAndRender();
  }

  function callApiForPage(page) {
    return user.repos(collectAllRepos, this, page);
  }

  return {
    showRepos: function(opts) {
      user      = gh.user(opts.user);
      page      = 1;
      allRepos  = [];
      options   = opts;

      callApiForPage(page);
    }
  };
})();
