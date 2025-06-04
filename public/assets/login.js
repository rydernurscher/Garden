// public/assets/login.js
const $ = id => document.getElementById(id);

window.addEventListener('DOMContentLoaded', () => {
  const loginV    = $('login-view');
  const registerV = $('register-view');
  const loginErr  = $('login-error');
  const regErr    = $('register-error');

  $('show-register').onclick = () => {
    loginErr.textContent = '';
    loginV.classList.add('hidden');
    registerV.classList.remove('hidden');
  };
  $('show-login').onclick = () => {
    regErr.textContent = '';
    registerV.classList.add('hidden');
    loginV.classList.remove('hidden');
  };

  $('btn-login').onclick = async () => {
    loginErr.textContent = '';
    const email    = $('login-email').value.trim();
    const password = $('login-password').value;
    if (!email || !password) {
      loginErr.textContent = 'Email and password are required.';
      return;
    }
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email:    email,
        password: password
      });
      if (error) {
        loginErr.textContent = error.message;
        return;
      }
      if (data && data.session && data.session.access_token) {
        localStorage.setItem('token', data.session.access_token);
        window.location.href = 'index.html';
      } else {
        loginErr.textContent = 'Login failed. Try again.';
      }
    } catch {
      loginErr.textContent = 'Network error. Please try again.';
    }
  };

  $('btn-register').onclick = async () => {
    regErr.textContent = '';
    const email    = $('reg-email').value.trim();
    const password = $('reg-password').value;
    if (!email || !password) {
      regErr.textContent = 'Email and password are required.';
      return;
    }
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email:    email,
        password: password
      });
      if (error) {
        regErr.textContent = error.message;
        return;
      }
      alert('Registered. Please check your email to confirm, then log in.');
      $('show-login').click();
    } catch {
      regErr.textContent = 'Network error. Please try again.';
    }
  };
});
