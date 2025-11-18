 // State
        let state = {
            billAmount: 0,
            includeVAT: true,
            tipPercent: 10,
            numPeople: 0,
            isDarkMode: false
        };

        // DOM Elements
        const billInput = document.getElementById('billAmount');
        const vatToggle = document.getElementById('vatToggle');
        const vatToggleWrapper = document.getElementById('vatToggleWrapper');
        const vatItem = document.getElementById('vatItem');
        const tipButtons = document.querySelectorAll('.tip-btn');
        const customTipInput = document.getElementById('customTip');
        const peopleInput = document.getElementById('numPeople');
        const themeToggle = document.getElementById('themeToggle');
        const resetBtn = document.getElementById('resetBtn');
        const shareBtn = document.getElementById('shareBtn');
        const shareHeaderBtn = document.getElementById('shareHeaderBtn');

        // Error elements
        const billError = document.getElementById('billError');
        const tipError = document.getElementById('tipError');
        const peopleError = document.getElementById('peopleError');

        // Result elements
        const subtotalEl = document.getElementById('subtotal');
        const vatAmountEl = document.getElementById('vatAmount');
        const tipAmountEl = document.getElementById('tipAmount');
        const tipPercentEl = document.getElementById('tipPercent');
        const totalAmountEl = document.getElementById('totalAmount');
        const perPersonSection = document.getElementById('perPersonSection');
        const perPersonAmountEl = document.getElementById('perPersonAmount');
        const splitCountEl = document.getElementById('splitCount');
        const peopleLabel = document.getElementById('peopleLabel');

        // Initialize
        function init() {
            // Load saved theme
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                state.isDarkMode = true;
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.textContent = '☀️';
            }

            calculate();
            attachEventListeners();
        }

        // Event Listeners
        function attachEventListeners() {
            billInput.addEventListener('input', handleBillInput);
            vatToggleWrapper.addEventListener('click', handleVATToggle);
            tipButtons.forEach(btn => btn.addEventListener('click', handleTipButtonClick));
            customTipInput.addEventListener('input', handleCustomTipInput);
            peopleInput.addEventListener('input', handlePeopleInput);
            themeToggle.addEventListener('click', handleThemeToggle);
            resetBtn.addEventListener('click', handleReset);
            shareBtn.addEventListener('click', handleShare);
            shareHeaderBtn.addEventListener('click', handleShare);
        }

        // Bill Input Handler
        function handleBillInput(e) {
            const value = parseFloat(e.target.value) || 0;
            
            if (e.target.value && value < 0) {
                billInput.classList.add('error');
                billError.classList.add('show');
                return;
            } else {
                billInput.classList.remove('error');
                billError.classList.remove('show');
            }

            state.billAmount = value;
            calculate();
        }

        // VAT Toggle Handler
        function handleVATToggle() {
            state.includeVAT = !state.includeVAT;
            vatToggle.classList.toggle('active');
            
            if (state.includeVAT) {
                vatItem.style.display = 'flex';
            } else {
                vatItem.style.display = 'none';
            }
            
            calculate();
        }

        // Tip Button Click Handler
        function handleTipButtonClick(e) {
            const tipValue = parseFloat(e.target.dataset.tip);
            
            // Remove active class from all buttons
            tipButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Clear custom tip input
            customTipInput.value = '';
            customTipInput.classList.remove('error');
            tipError.classList.remove('show');
            
            state.tipPercent = tipValue;
            calculate();
        }

        // Custom Tip Input Handler
        function handleCustomTipInput(e) {
            const value = parseFloat(e.target.value);
            
            if (e.target.value && (isNaN(value) || value < 0)) {
                customTipInput.classList.add('error');
                tipError.classList.add('show');
                return;
            } else {
                customTipInput.classList.remove('error');
                tipError.classList.remove('show');
            }

            if (e.target.value) {
                // Remove active class from all preset buttons
                tipButtons.forEach(btn => btn.classList.remove('active'));
                state.tipPercent = value;
            } else {
                // If cleared, default to 10%
                state.tipPercent = 10;
                tipButtons.forEach(btn => {
                    if (btn.dataset.tip === '10') {
                        btn.classList.add('active');
                    }
                });
            }
            
            calculate();
        }

        // People Input Handler
        function handlePeopleInput(e) {
            const value = parseInt(e.target.value) || 0;
            
            if (e.target.value && value < 1) {
                peopleInput.classList.add('error');
                peopleError.classList.add('show');
                state.numPeople = 0;
            } else {
                peopleInput.classList.remove('error');
                peopleError.classList.remove('show');
                state.numPeople = value;
            }

            // Update label
            if (value === 1) {
                peopleLabel.textContent = 'person';
            } else {
                peopleLabel.textContent = 'people';
            }
            
            calculate();
        }

        // Theme Toggle Handler
        function handleThemeToggle() {
            state.isDarkMode = !state.isDarkMode;
            
            if (state.isDarkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
                themeToggle.textContent = '🌙';
                localStorage.setItem('theme', 'light');
            }
        }

        // Reset Handler
        function handleReset() {
            state = {
                billAmount: 0,
                includeVAT: true,
                tipPercent: 10,
                numPeople: 0,
                isDarkMode: state.isDarkMode
            };

            // Reset inputs
            billInput.value = '';
            customTipInput.value = '';
            peopleInput.value = '';
            
            // Reset errors
            billInput.classList.remove('error');
            customTipInput.classList.remove('error');
            peopleInput.classList.remove('error');
            billError.classList.remove('show');
            tipError.classList.remove('show');
            peopleError.classList.remove('show');

            // Reset VAT toggle
            if (!state.includeVAT) {
                vatToggle.classList.add('active');
                vatItem.style.display = 'flex';
                state.includeVAT = true;
            }

            // Reset tip buttons
            tipButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tip === '10') {
                    btn.classList.add('active');
                }
            });

            // Reset people label
            peopleLabel.textContent = 'people';

            calculate();
            showToast('Calculator reset! 🔄');
        }

        // Share Handler
        async function handleShare() {
            const { subtotal, vat, tip, total, perPerson } = calculateValues();
            
            const shareText = `Nigerian Bill Calculator 🧮\n\nSubtotal: ₦${formatCurrency(subtotal)}\n${state.includeVAT ? `VAT (7.5%): ₦${formatCurrency(vat)}\n` : ''}Tip (${state.tipPercent}%): ₦${formatCurrency(tip)}\nTotal: ₦${formatCurrency(total)}${state.numPeople > 0 ? `\n\nPer Person (${state.numPeople}): ₦${formatCurrency(perPerson)}` : ''}`;

            const shareTitle = 'Nigerian Tip & Tax Calculator';
            
            // Check if Web Share API is available (works on mobile for WhatsApp, Instagram, etc.)
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: shareTitle,
                        text: shareText
                    });
                    showToast('Shared successfully! 📤');
                } catch (err) {
                    // User cancelled the share
                    if (err.name !== 'AbortError') {
                        showShareOptions(shareText, shareTitle);
                    }
                }
            } else {
                // Fallback: Show share options modal
                showShareOptions(shareText, shareTitle);
            }
        }

        // Show Share Options Modal
        function showShareOptions(text, title) {
            // Remove existing modal if any
            const existingModal = document.querySelector('.share-modal');
            if (existingModal) {
                existingModal.remove();
            }

            const encodedText = encodeURIComponent(text);
            const encodedTitle = encodeURIComponent(title);

            const modal = document.createElement('div');
            modal.className = 'share-modal';
            modal.innerHTML = `
                <div class="share-modal-overlay"></div>
                <div class="share-modal-content">
                    <div class="share-modal-header">
                        <h3>Share via</h3>
                        <button class="share-modal-close" aria-label="Close">✕</button>
                    </div>
                    <div class="share-options">
                        <a href="https://wa.me/?text=${encodedText}" target="_blank" class="share-option whatsapp">
                            <span class="share-icon">💬</span>
                            <span>WhatsApp</span>
                        </a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}" target="_blank" class="share-option facebook">
                            <span class="share-icon">👥</span>
                            <span>Facebook</span>
                        </a>
                        <a href="https://twitter.com/intent/tweet?text=${encodedText}" target="_blank" class="share-option twitter">
                            <span class="share-icon">🐦</span>
                            <span>Twitter</span>
                        </a>
                        <a href="mailto:?subject=${encodedTitle}&body=${encodedText}" class="share-option email">
                            <span class="share-icon">📧</span>
                            <span>Email</span>
                        </a>
                        <a href="sms:?body=${encodedText}" class="share-option sms">
                            <span class="share-icon">💬</span>
                            <span>SMS</span>
                        </a>
                        <button class="share-option copy-btn" onclick="copyShareText('${text.replace(/'/g, "\\'")}')">
                            <span class="share-icon">📋</span>
                            <span>Copy</span>
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Add event listeners
            const overlay = modal.querySelector('.share-modal-overlay');
            const closeBtn = modal.querySelector('.share-modal-close');
            
            overlay.addEventListener('click', closeShareModal);
            closeBtn.addEventListener('click', closeShareModal);

            // Add styles for modal
            addShareModalStyles();
        }

        // Close Share Modal
        function closeShareModal() {
            const modal = document.querySelector('.share-modal');
            if (modal) {
                modal.style.animation = 'modalOut 0.3s ease';
                setTimeout(() => modal.remove(), 300);
            }
        }

        // Copy Share Text
        window.copyShareText = function(text) {
            copyToClipboard(text);
            closeShareModal();
        }

        // Add Share Modal Styles
        function addShareModalStyles() {
            if (document.getElementById('share-modal-styles')) return;

            const style = document.createElement('style');
            style.id = 'share-modal-styles';
            style.textContent = `
                .share-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: modalIn 0.3s ease;
                }

                @keyframes modalIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes modalOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }

                .share-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                }

                .share-modal-content {
                    position: relative;
                    background: var(--bg-card);
                    border-radius: var(--radius-xl);
                    padding: var(--space-2xl);
                    max-width: 500px;
                    width: 90%;
                    box-shadow: var(--shadow-xl);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid var(--border-color);
                }

                @keyframes slideUp {
                    from { transform: translateY(50px) scale(0.9); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }

                .share-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-xl);
                }

                .share-modal-header h3 {
                    font-size: 1.5rem;
                    color: var(--text-primary);
                    font-weight: 700;
                }

                .share-modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-secondary);
                    width: 2.5rem;
                    height: 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all var(--transition-normal);
                }

                .share-modal-close:hover {
                    background: var(--hover-bg);
                    color: var(--text-primary);
                    transform: rotate(90deg);
                }

                .share-options {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--space-lg);
                }

                .share-option {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-sm);
                    padding: var(--space-lg);
                    background: var(--hover-bg);
                    border: 2px solid transparent;
                    border-radius: var(--radius-lg);
                    text-decoration: none;
                    color: var(--text-primary);
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: all var(--transition-normal);
                    cursor: pointer;
                }

                .share-option:hover {
                    background: var(--hover-bg-dark);
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-md);
                    border-color: var(--green-primary);
                }

                .share-option:active {
                    transform: translateY(-2px);
                }

                .share-icon {
                    font-size: 2rem;
                }

                .share-option.whatsapp:hover {
                    background: #25D366;
                    color: white;
                }

                .share-option.facebook:hover {
                    background: #1877F2;
                    color: white;
                }

                .share-option.twitter:hover {
                    background: #1DA1F2;
                    color: white;
                }

                .share-option.email:hover {
                    background: #EA4335;
                    color: white;
                }

                .share-option.sms:hover {
                    background: #34C759;
                    color: white;
                }

                .share-option.copy-btn:hover {
                    background: var(--green-primary);
                    color: white;
                }

                @media (max-width: 480px) {
                    .share-options {
                        grid-template-columns: repeat(2, 1fr);
                        gap: var(--space-md);
                    }

                    .share-modal-content {
                        padding: var(--space-xl);
                    }

                    .share-option {
                        padding: var(--space-md);
                        font-size: 0.75rem;
                    }

                    .share-icon {
                        font-size: 1.5rem;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Copy to Clipboard
        function copyToClipboard(text) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast('Copied to clipboard! 📋');
                }).catch(() => {
                    showToast('Failed to copy', true);
                });
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    showToast('Copied to clipboard! 📋');
                } catch (err) {
                    showToast('Failed to copy', true);
                }
                document.body.removeChild(textarea);
            }
        }

        // Calculate Values
        function calculateValues() {
            const subtotal = state.billAmount;
            const vat = state.includeVAT ? subtotal * 0.075 : 0;
            const subtotalWithVAT = subtotal + vat;
            const tip = subtotalWithVAT * (state.tipPercent / 100);
            const total = subtotalWithVAT + tip;
            const perPerson = state.numPeople > 0 ? total / state.numPeople : 0;

            return { subtotal, vat, tip, total, perPerson };
        }

        // Calculate and Update UI
        function calculate() {
            const { subtotal, vat, tip, total, perPerson } = calculateValues();

            // Update UI
            subtotalEl.textContent = `₦${formatCurrency(subtotal)}`;
            vatAmountEl.textContent = `₦${formatCurrency(vat)}`;
            tipAmountEl.textContent = `₦${formatCurrency(tip)}`;
            tipPercentEl.textContent = state.tipPercent;
            totalAmountEl.textContent = `₦${formatCurrency(total)}`;

            // Show/hide per person section
            if (state.numPeople > 0) {
                perPersonSection.style.display = 'flex';
                perPersonAmountEl.textContent = `₦${formatCurrency(perPerson)}`;
                splitCountEl.textContent = state.numPeople;
            } else {
                perPersonSection.style.display = 'none';
            }
        }

        // Format Currency
        function formatCurrency(amount) {
            return amount.toLocaleString('en-NG', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        // Show Toast
        function showToast(message, isError = false) {
            // Remove existing toast if any
            const existingToast = document.querySelector('.toast');
            if (existingToast) {
                existingToast.remove();
            }

            const toast = document.createElement('div');
            toast.className = `toast${isError ? ' error' : ''}`;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'toastOut 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        }

        // Initialize app
        init();
