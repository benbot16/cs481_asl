window.onload = function () {
  const navMap = [
    { selector: '#start-signup', target: 'signUp.html' },
    { selector: '#start-signin', target: 'signIn.html' },
    { selector: '#signUpButton', target: 'signUp.html' },
    { selector: '#signInButton', target: 'signIn.html' }, 
    { selector: '.signInButton', target: 'signIn.html' },  
    { selector: '.signUpButton', target: 'signUp.html' },  
    { selector: '#startSigningButton', target: 'video.html' }
  ];

  navMap.forEach(({ selector, target }) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.addEventListener('click', function () {
        window.location.href = target;
      });
    });
  });
};
