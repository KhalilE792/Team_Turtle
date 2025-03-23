    document.addEventListener('DOMContentLoaded', function() {
      // Get DOM elements
      const loginTab = document.getElementById('login-tab');
      const registerTab = document.getElementById('register-tab');
      const loginForm = document.getElementById('loginForm');
      const registerForm = document.getElementById('registerForm');
      const loginFormElement = document.getElementById('loginFormElement');
      const registerFormElement = document.getElementById('registerFormElement');
      const successMessage = document.getElementById('successMessage');
      const errorMessage = document.getElementById('errorMessage');
      const loginSpinner = document.getElementById('loginSpinner');
      const registerSpinner = document.getElementById('registerSpinner');
      const agreeButton = document.getElementById('agreeButton');
      
      // Terms modal agreement
      agreeButton.addEventListener('click', function() {
        document.getElementById('agreeTerms').checked = true;
      });
      
      // Tab switching logic
      function switchToTab(tabElement) {
        // Remove active class from all tabs and tab panes
        document.querySelectorAll('#authTabs button').forEach(el => {
          el.classList.remove('active');
          el.setAttribute('aria-selected', 'false');
        });
        
        document.querySelectorAll('.tab-pane').forEach(el => {
          el.classList.remove('show', 'active');
        });
        
        // Add active class to selected tab and tab pane
        tabElement.classList.add('active');
        tabElement.setAttribute('aria-selected', 'true');
        
        const target = document.querySelector(tabElement.getAttribute('data-bs-target'));
        target.classList.add('show', 'active');
      }
      
      // Add tab switching event listeners
      loginTab.addEventListener('click', function() {
        switchToTab(loginTab);
      });
      
      registerTab.addEventListener('click', function() {
        switchToTab(registerTab);
      });
      
      // Check for remembered user
      const rememberedUser = localStorage.getItem('rememberedUser');
      
      if (rememberedUser) {
        try {
          const userData = JSON.parse(rememberedUser);
          document.getElementById('loginEmail').value = userData.email;
          document.getElementById('rememberMe').checked = true;
        } catch (e) {
          localStorage.removeItem('rememberedUser');
          console.error('Error parsing remembered user data:', e);
        }
      }
      
      // Helper functions for showing messages
      function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 5000);
      }
      
      function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          errorMessage.style.display = 'none';
        }, 5000);
      }
      
      // Login form submission
      loginFormElement.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Show loading spinner
        loginSpinner.style.display = 'inline-block';
        
        // Get form values
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                // Store email if remember me is checked
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', JSON.stringify({
                        email: email,
                        timestamp: new Date().toISOString()
                    }));
                }
                
                showSuccess('Login successful! Redirecting...');
                window.location.href = '/'; // Redirect to homepage
            } else {
                const data = await response.json();
                showError(data.message || 'Login failed');
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
            console.error('Login error:', error);
        } finally {
            loginSpinner.style.display = 'none';
        }
      });
      
      // Registration form submission
      registerFormElement.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Show loading spinner
        registerSpinner.style.display = 'inline-block';
        
        // Get form values
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Basic validation
        if (!agreeTerms) {
            showError('You must agree to the Terms and Conditions.');
            registerSpinner.style.display = 'none';
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match.');
            registerSpinner.style.display = 'none';
            return;
        }
        
        if (password.length < 8) {
            showError('Password must be at least 8 characters long.');
            registerSpinner.style.display = 'none';
            return;
        }
        
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            if (response.ok) {
                showSuccess('Registration successful! Please log in.');
                switchToTab(loginTab);
                document.getElementById('loginEmail').value = email;
            } else {
                const data = await response.json();
                showError(data.message || 'Registration failed');
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
            console.error('Registration error:', error);
        } finally {
            registerSpinner.style.display = 'none';
        }
      });
      
      // Forgot password link handling
      document.getElementById('forgotPasswordLink').addEventListener('click', function(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        
        if (email) {
          alert(`Password reset link would be sent to: ${email}`);
        } else {
          alert('Please enter your email address first.');
        }
      });
    });