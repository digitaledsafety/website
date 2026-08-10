auth0.createAuth0Client({
    domain: "dev-7gsexowurjtyvfvm.us.auth0.com",
    clientId: "7r7WkHoI4IO8BVtP39h1LMw11dK3rmno",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  }).then(async (auth0Client) => {
    // Assumes a button with id "login" in the DOM
    const loginButton = document.getElementById("login");
  
    loginButton.addEventListener("click", (e) => {
      e.preventDefault();
      auth0Client.loginWithRedirect();
    });
  
    if (location.search.includes("state=") && 
        (location.search.includes("code=") || 
        location.search.includes("error="))) {
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, "/");
    }
  
    // Assumes a button with id "logout" in the DOM
    const logoutButton = document.getElementById("logout");
  
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      auth0Client.logout();
    });
  
    const isAuthenticated = await auth0Client.isAuthenticated();
    const userProfile = await auth0Client.getUser();
  
    // Assumes an element with id "profile" in the DOM
    const profileElement = document.getElementById("navbarDropdown");

    if (isAuthenticated) {
      loginButton.hidden = true;
      logoutButton.hidden = false;
      profileElement.style.display = "block";
      profileElement.innerHTML = `
              <img src="${userProfile.picture}" />
            `;
    } else {
      loginButton.hidden = false;
      logoutButton.hidden = true;
      profileElement.style.display = "none";
    }
  });

  // Masthead Parallax Effect
  (function() {
    const masthead = document.querySelector("header.masthead");
    if (!masthead) return;

    let isFixed = window.getComputedStyle(masthead).backgroundAttachment === 'fixed';

    // Update isFixed on resize as it might change based on media queries
    window.addEventListener('resize', () => {
      isFixed = window.getComputedStyle(masthead).backgroundAttachment === 'fixed';
    });

    document.addEventListener("scroll", function() {
      if (isFixed) return;

      const scrollOffset = window.pageYOffset;
      const speed = 0.5;
      window.requestAnimationFrame(() => {
        masthead.style.backgroundPositionY = (scrollOffset * speed) + "px";
      });
    }, { passive: true });
  })();
