document.addEventListener('DOMContentLoaded', function() {
    const chatButton = document.getElementById('chatButton');
    const chatBox = document.getElementById('chatBox');
    const closeChat = document.getElementById('closeChat');
    const sendMessage = document.getElementById('sendMessage');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');

    // Toggle chat box
    chatButton.addEventListener('click', () => {
        chatBox.classList.toggle('active');
        if (chatBox.classList.contains('active')) {
            userInput.focus();
        }
    });

    closeChat.addEventListener('click', () => {
        chatBox.classList.remove('active');
    });

    // Send message function
    function sendUserMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        addMessage(message, 'user');
        
        // Clear input
        userInput.value = '';

        // Get bot response
        getBotResponse(message);
    }

    // Send message on button click
    sendMessage.addEventListener('click', sendUserMessage);

    // Send message on Enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Get bot response using OpenAI API
    async function getBotResponse(message) {
        try {
            // Show typing indicator
            addMessage('...', 'bot typing');

            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            
            // Remove typing indicator
            const typingIndicator = chatMessages.querySelector('.bot.typing');
            if (typingIndicator) {
                chatMessages.removeChild(typingIndicator);
            }

            // Add bot's response
            addMessage(data.response, 'bot');

        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }

    // Language switcher
    const langButton = document.querySelector('.lang-option');
    const flagIcon = langButton.querySelector('.flag-icon');

    langButton.addEventListener('click', () => {
        const currentLang = langButton.getAttribute('data-lang');
        const newLang = currentLang === 'en' ? 'de' : 'en';
        
        // Update button attributes
        langButton.setAttribute('data-lang', newLang);
        flagIcon.src = `assets/images/flags/${newLang}.svg`;
        flagIcon.alt = newLang === 'en' ? 'English' : 'Deutsch';
        
        // Update content
        updateContent(newLang);
    });

    function updateContent(lang) {
        // Update all text content based on language
        const translations = {
            en: {
                about: 'About Me',
                experience: 'Experience',
                education: 'Education',
                skills: 'Skills',
                contact: 'Contact'
            },
            de: {
                about: 'Über Mich',
                experience: 'Erfahrung',
                education: 'Ausbildung',
                skills: 'Fähigkeiten',
                contact: 'Kontakt'
            }
        };

        // Update navigation links
        document.querySelectorAll('.menu-link').forEach(link => {
            const key = link.getAttribute('href').replace('#', '');
            if (translations[lang][key]) {
                link.textContent = translations[lang][key];
            }
        });
    }

    // Hamburger menu functionality
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const menuItems = document.querySelector('.menu-items');
    const closeMenu = document.querySelector('.close-menu');

    hamburgerMenu.addEventListener('click', function() {
        menuItems.classList.add('active');
        hamburgerMenu.classList.add('active');
    });

    closeMenu.addEventListener('click', function() {
        menuItems.classList.remove('active');
        hamburgerMenu.classList.remove('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!menuItems.contains(event.target) && !hamburgerMenu.contains(event.target)) {
            menuItems.classList.remove('active');
            hamburgerMenu.classList.remove('active');
        }
    });
}); 