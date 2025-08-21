// Function to display messages in the custom message box
function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800', 'bg-blue-100', 'text-blue-800', 'animate-pulse');

    if (type === 'success') {
        messageBox.classList.add('bg-green-100'); // Green background style for success
    } else if (type === 'error') {
        messageBox.classList.add('bg-red-100'); // Red background style for error
    } else { // info
        messageBox.classList.add('bg-blue-100'); // Blue background style for info
    }
    messageBox.classList.remove('hidden');
    messageBox.classList.add('animate-pulse'); // Add pulse animation to messages

    // Hide message after 3 seconds
    setTimeout(() => {
        messageBox.classList.add('hidden');
        messageBox.classList.remove('animate-pulse');
    }, 3000);
}

// Function to handle form submission
function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Retrieve custom credentials from sessionStorage
    const customUsername = sessionStorage.getItem('customUsername');
    const customPassword = sessionStorage.getItem('customPassword');

    // Use custom credentials if they exist, otherwise use hardcoded ones
    const users = {};
    if (customUsername && customPassword) {
        users[customUsername] = customPassword;
    } else {
        users['admin'] = 'Gujjar@5757';
        users['gautamgujjar565657@gmail.com'] = 'Gautam5757';
        users['hemant'] = '2327';
    }

    if (users.hasOwnProperty(username) && users[username] === password) {
        // Correct credentials: Show success message and transition
        showMessage('Login successful!', 'success');
        
        // Remove the old admin check from the login page
        sessionStorage.removeItem('isAdmin');

        showWelcomeTransition(username); // Pass the username to the transition
    } else {
        // Incorrect credentials: Show error message
        showMessage('Invalid username or password. Please try again.', 'error');
        console.log('Login failed for:', username);
    }
}

// --- Welcome Transition Function ---
function showWelcomeTransition(username) {
    const transitionScreen = document.getElementById('welcomeTransition');
    const welcomeText = transitionScreen.querySelector('.welcome-text');

    // Make the transition screen visible
    transitionScreen.style.display = 'flex';
    
    // Animate the text and content
    welcomeText.innerHTML = `Welcome, ${username} to the world of GHH`;
    welcomeText.style.opacity = 1;

    // Redirect after a delay to allow the animation to play
    setTimeout(() => {
        window.location.href = 'page2.html';
    }, 3000); // Redirect after 3 seconds
}

// --- Pop-up Modal Functions ---
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');

// Function to open the modal
function openModal(event) {
    event.preventDefault(); // Prevent default link behavior (e.g., scrolling to top)
    forgotPasswordModal.classList.add('show');
}

// Function to close the modal
function closeModal() {
    forgotPasswordModal.classList.remove('show');
}

// Attach event listener to the "Forgot Password?" link
forgotPasswordLink.addEventListener('click', openModal);

// Close modal if user clicks outside of it
window.addEventListener('click', (event) => {
    if (event.target === forgotPasswordModal) {
        closeModal();
        closeCustomizeModal();
    }
});
// --- End Pop-up Modal Functions ---

// New functions for the customization modal
function openCustomizeModal() {
    const customizeModal = document.getElementById('customizeModal');
    // Pre-fill fields with current values if they exist
    const currentHeading = document.getElementById('mainHeading').textContent;
    const currentUsername = sessionStorage.getItem('customUsername');
    document.getElementById('newHeadingInput').value = currentHeading;
    if (currentUsername) {
        document.getElementById('newUsernameInput').value = currentUsername;
    } else {
        document.getElementById('newUsernameInput').value = '';
    }
    document.getElementById('newPasswordInput').value = ''; // Don't pre-fill password for security
    
    customizeModal.classList.add('show');
}

function closeCustomizeModal() {
    const customizeModal = document.getElementById('customizeModal');
    customizeModal.classList.remove('show');
}

function saveCustomizations() {
    const newHeading = document.getElementById('newHeadingInput').value;
    const newUsername = document.getElementById('newUsernameInput').value;
    const newPassword = document.getElementById('newPasswordInput').value;

    if (newHeading) {
        document.getElementById('mainHeading').textContent = newHeading;
        sessionStorage.setItem('customHeading', newHeading);
    }

    if (newUsername && newPassword) {
        sessionStorage.setItem('customUsername', newUsername);
        sessionStorage.setItem('customPassword', newPassword);
        showMessage("Custom credentials saved for this session.", "success");
    } else {
        showMessage("Changes saved, but credentials not updated.", "info");
    }

    closeCustomizeModal();
}

// Ensure the login card fades in and bounces and load custom settings when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const loginCard = document.querySelector('.login-card');
    const customHeading = sessionStorage.getItem('customHeading');
    if (customHeading) {
        document.getElementById('mainHeading').textContent = customHeading;
    }
});