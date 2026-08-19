// AI Assistant Module for SuperMarket Pro
class AIAssistant {
    constructor() {
        this.history = [];
        this.isOpen = false;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.renderWidget());
        } else {
            this.renderWidget();
        }
    }

    renderWidget() {
        if (document.getElementById('aiChatWidgetContainer')) return;

        const container = document.createElement('div');
        container.id = 'aiChatWidgetContainer';
        container.innerHTML = `
            <!-- Floating Trigger Button -->
            <button id="aiChatToggle" class="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 group focus:outline-none">
                <div class="relative">
                    <i class="fas fa-robot text-2xl group-hover:rotate-12 transition-transform"></i>
                    <span class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-ping"></span>
                    <span class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <span class="font-semibold text-sm hidden group-hover:inline-block pr-1 transition-all">AI Assistant</span>
            </button>

            <!-- Chat Window -->
            <div id="aiChatWindow" class="fixed bottom-24 right-6 z-50 w-96 max-w-[92vw] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col hidden overflow-hidden transition-all duration-300 transform scale-95">
                <!-- Header -->
                <div class="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-4 flex justify-between items-center shadow-md">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <i class="fas fa-robot text-xl text-white"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-base flex items-center space-x-2">
                                <span>SuperMarket AI</span>
                                <span class="text-xs bg-green-400/30 text-white px-2 py-0.5 rounded-full border border-white/20">Gemini 2.5</span>
                            </h3>
                            <p class="text-xs text-green-100 flex items-center">
                                <span class="w-2 h-2 bg-green-300 rounded-full inline-block mr-1.5 animate-pulse"></span>
                                Online & Ready to help
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button id="aiResetChat" title="Reset Chat" class="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
                            <i class="fas fa-rotate-right text-sm"></i>
                        </button>
                        <button id="aiCloseChat" title="Close" class="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
                            <i class="fas fa-times text-lg"></i>
                        </button>
                    </div>
                </div>

                <!-- Messages Container -->
                <div id="aiChatMessages" class="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 text-sm">
                    <!-- Welcome Message -->
                    <div class="flex items-start space-x-2">
                        <div class="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-1">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[85%] text-gray-800 leading-relaxed">
                            👋 Hi there! I'm your **SuperMarket AI Assistant**. How can I help you today?
                            <div class="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 font-medium">Try asking me:</div>
                            <div class="mt-2 flex flex-wrap gap-1.5">
                                <button class="ai-suggestion-chip text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-full transition">
                                    🥗 Recipe with Paneer
                                </button>
                                <button class="ai-suggestion-chip text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-full transition">
                                    💪 High Protein Foods
                                </button>
                                <button class="ai-suggestion-chip text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-full transition">
                                    🏷️ Current Deals
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Input Footer -->
                <div class="p-3 bg-white border-t border-gray-100">
                    <form id="aiChatForm" class="flex items-center space-x-2">
                        <input type="text" id="aiChatInput" placeholder="Ask AI about products, recipes..." 
                               class="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-gray-50 transition" required>
                        <button type="submit" id="aiChatSendBtn" 
                                class="bg-green-600 hover:bg-green-700 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition disabled:opacity-50">
                            <i class="fas fa-paper-plane text-sm"></i>
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        this.attachEvents();
    }

    attachEvents() {
        const toggleBtn = document.getElementById('aiChatToggle');
        const closeBtn = document.getElementById('aiCloseChat');
        const resetBtn = document.getElementById('aiResetChat');
        const chatForm = document.getElementById('aiChatForm');

        toggleBtn?.addEventListener('click', () => this.toggleChat());
        closeBtn?.addEventListener('click', () => this.toggleChat(false));
        resetBtn?.addEventListener('click', () => this.resetChat());
        chatForm?.addEventListener('submit', (e) => this.handleSubmit(e));

        // Event delegation for suggestion chips
        document.getElementById('aiChatMessages')?.addEventListener('click', (e) => {
            const chip = e.target.closest('.ai-suggestion-chip');
            if (chip) {
                const text = chip.innerText.replace(/^[^\s]+\s*/, ''); // strip emoji
                const input = document.getElementById('aiChatInput');
                if (input) {
                    input.value = text;
                    this.handleSubmit(new Event('submit'));
                }
            }
        });
    }

    toggleChat(show = null) {
        const windowEl = document.getElementById('aiChatWindow');
        if (!windowEl) return;

        this.isOpen = show !== null ? show : !this.isOpen;
        if (this.isOpen) {
            windowEl.classList.remove('hidden');
            setTimeout(() => {
                windowEl.classList.remove('scale-95');
                document.getElementById('aiChatInput')?.focus();
            }, 10);
        } else {
            windowEl.classList.add('scale-95');
            setTimeout(() => windowEl.classList.add('hidden'), 200);
        }
    }

    resetChat() {
        this.history = [];
        const messages = document.getElementById('aiChatMessages');
        if (messages) {
            messages.innerHTML = `
                <div class="flex items-start space-x-2">
                    <div class="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-1">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[85%] text-gray-800 leading-relaxed">
                        Chat reset! How else can I assist you with your grocery shopping today?
                    </div>
                </div>
            `;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        if (!message) return;

        // Clear input & disable button
        input.value = '';
        const sendBtn = document.getElementById('aiChatSendBtn');
        sendBtn.disabled = true;

        // Render User Message
        this.appendMessage('user', message);

        // Render Typing Indicator
        const typingId = this.appendTypingIndicator();

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: this.history })
            });

            const data = await response.json();
            this.removeTypingIndicator(typingId);

            if (data.success && data.reply) {
                this.appendMessage('assistant', data.reply);
                this.history.push({ role: 'user', content: message });
                this.history.push({ role: 'assistant', content: data.reply });
            } else {
                this.appendMessage('assistant', data.message || "I couldn't process your request right now. Please try again.");
            }
        } catch (err) {
            console.error('AI Chat Assistant Error:', err);
            this.removeTypingIndicator(typingId);
            this.appendMessage('assistant', "I'm having trouble connecting to the server right now. Please make sure the backend server is running.");
        } finally {
            sendBtn.disabled = false;
        }
    }

    appendMessage(role, text) {
        const messages = document.getElementById('aiChatMessages');
        if (!messages) return;

        const wrapper = document.createElement('div');
        wrapper.className = role === 'user' ? 'flex justify-end' : 'flex items-start space-x-2';

        const formattedText = this.formatMarkdown(text);

        if (role === 'user') {
            wrapper.innerHTML = `
                <div class="bg-green-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] text-sm leading-relaxed">
                    ${formattedText}
                </div>
            `;
        } else {
            wrapper.innerHTML = `
                <div class="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-1">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[85%] text-gray-800 leading-relaxed">
                    ${formattedText}
                </div>
            `;
        }

        messages.appendChild(wrapper);
        messages.scrollTop = messages.scrollHeight;
    }

    appendTypingIndicator() {
        const messages = document.getElementById('aiChatMessages');
        if (!messages) return null;

        const id = 'typing_' + Date.now();
        const wrapper = document.createElement('div');
        wrapper.id = id;
        wrapper.className = 'flex items-start space-x-2';
        wrapper.innerHTML = `
            <div class="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-1">
                <i class="fas fa-robot"></i>
            </div>
            <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center space-x-1.5 text-gray-400">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
        `;

        messages.appendChild(wrapper);
        messages.scrollTop = messages.scrollHeight;
        return id;
    }

    removeTypingIndicator(id) {
        if (!id) return;
        document.getElementById(id)?.remove();
    }

    formatMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
}

// Global AIAssistant instance
const aiAssistant = new AIAssistant();
