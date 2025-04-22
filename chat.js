document.addEventListener('DOMContentLoaded', function() {
    const chatButton = document.getElementById('chatButton');
    const chatBox = document.getElementById('chatBox');
    const closeChat = document.getElementById('closeChat');
    const sendMessage = document.getElementById('sendMessage');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    
    // Get current language from HTML lang attribute
    function getCurrentLanguage() {
        return document.documentElement.getAttribute('lang') || 'en';
    }

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

            // Get current language from HTML
            const currentLanguage = getCurrentLanguage();
            
            const response = await fetch('https://gsommer.netlify.app/.netlify/functions/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message,
                    language: currentLanguage
                })
            });

            const data = await response.json();

            // Remove typing indicator
            const typingIndicator = chatMessages.querySelector('.bot.typing');
            if (typingIndicator) {
                chatMessages.removeChild(typingIndicator);
            }

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            // Add bot's response
            addMessage(data.response, 'bot');

        } catch (error) {
            console.error('Error:', error);
            const errorMessages = {
                en: {
                    default: 'Sorry, I encountered an error. Please try again.',
                    config: 'Configuration error. Please check the API settings.',
                    auth: 'Authentication error. Please check the API key.',
                    rate: 'Rate limit exceeded. Please try again later.'
                },
                de: {
                    default: 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
                    config: 'Konfigurationsfehler. Bitte überprüfen Sie die API-Einstellungen.',
                    auth: 'Authentifizierungsfehler. Bitte überprüfen Sie den API-Schlüssel.',
                    rate: 'Rate-Limit überschritten. Bitte versuchen Sie es später erneut.'
                }
            };
            
            const currentLanguage = getCurrentLanguage();
            let errorMessage = errorMessages[currentLanguage].default;
            
            if (error.message.includes('Configuration')) {
                errorMessage = errorMessages[currentLanguage].config;
            } else if (error.message.includes('Authentication')) {
                errorMessage = errorMessages[currentLanguage].auth;
            } else if (error.message.includes('Rate limit')) {
                errorMessage = errorMessages[currentLanguage].rate;
            }
            
            addMessage(errorMessage, 'bot');
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
        
        // Update content and chat language
        updateContent(newLang);
        currentLang = newLang;
        updateInitialMessage();
    });

    function updateContent(lang) {
        // Update all text content based on language
        const translations = {
            en: {
                about: 'About Me',
                experience: 'Experience',
                education: 'Education',
                skills: 'Skills',
                contact: 'Contact',
                placeholder: 'Ask me anything...'
            },
            de: {
                about: 'Über Mich',
                experience: 'Erfahrung',
                education: 'Ausbildung',
                skills: 'Fähigkeiten',
                contact: 'Kontakt',
                placeholder: 'Fragen Sie mich etwas...'
            }
        };

        // Update navigation links
        document.querySelectorAll('.menu-link').forEach(link => {
            const key = link.getAttribute('href').replace('#', '');
            if (translations[lang][key]) {
                link.textContent = translations[lang][key];
            }
        });

        // Update chat input placeholder
        userInput.placeholder = translations[lang].placeholder;
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

    // Initialize chat with current language
    updateInitialMessage();
    updateContent(getCurrentLanguage());
}); 