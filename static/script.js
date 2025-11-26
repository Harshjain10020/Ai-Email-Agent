document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentCategory = 'All';
    let selectedEmailId = null;
    let emails = [];

    // DOM Elements
    const emailListEl = document.getElementById('email-list');
    const emailListContainer = document.querySelector('.email-list-container');
    const emailDetailEl = document.getElementById('email-detail');
    const detailContentEl = document.getElementById('detail-content');
    const navItems = document.querySelectorAll('.nav-item');
    const backBtn = document.getElementById('back-btn');
    const processBtn = document.getElementById('process-btn');

    // AI Elements
    const aiTabs = document.querySelectorAll('.ai-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const generateReplyBtn = document.getElementById('generate-reply-btn');
    const replyArea = document.getElementById('reply-area');
    const replyText = document.getElementById('reply-text');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const summarizeBtn = document.getElementById('summarize-btn');
    const summaryResult = document.getElementById('summary-result');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // Initialization
    fetchEmails();

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            currentCategory = item.dataset.category;
            fetchEmails();
            showList();
        });
    });

    backBtn.addEventListener('click', showList);

    processBtn.addEventListener('click', async () => {
        processBtn.disabled = true;
        processBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Processing...';
        try {
            const res = await fetch('/api/process', { method: 'POST' });
            const data = await res.json();
            alert(data.message);
            fetchEmails();
        } catch (err) {
            console.error(err);
            alert('Error processing emails');
        } finally {
            processBtn.disabled = false;
            processBtn.innerHTML = '<span class="material-icons">auto_awesome</span> Process All Emails';
        }
    });

    // API Calls
    async function fetchEmails() {
        try {
            const res = await fetch(`/api/emails?category=${currentCategory}`);
            emails = await res.json();
            renderEmailList();
            updateCounts();
        } catch (err) {
            console.error(err);
            emailListEl.innerHTML = '<div class="loading">Error loading emails</div>';
        }
    }

    async function fetchEmailDetail(id) {
        try {
            const res = await fetch(`/api/emails/${id}`);
            const email = await res.json();
            renderEmailDetail(email);
            selectedEmailId = id;
            showDetail();
            
            // Reset AI tabs
            resetAiPanel();
        } catch (err) {
            console.error(err);
        }
    }

    // Rendering
    function renderEmailList() {
        emailListEl.innerHTML = '';
        if (emails.length === 0) {
            emailListEl.innerHTML = '<div class="loading">No emails found</div>';
            return;
        }

        emails.forEach(email => {
            const el = document.createElement('div');
            el.className = `email-item ${email.read ? 'read' : 'unread'}`;
            el.onclick = () => fetchEmailDetail(email.id);
            
            const badge = email.category ? `<span class="badge badge-${email.category}">${email.category}</span>` : '';
            
            el.innerHTML = `
                <div class="checkbox-wrapper" onclick="event.stopPropagation()">
                    <span class="material-icons">check_box_outline_blank</span>
                </div>
                <div class="email-sender">${email.from}</div>
                <div class="email-content">
                    <span class="email-subject">${email.subject}</span>
                    <span class="email-snippet">- ${email.body.substring(0, 50)}...</span>
                    ${badge}
                </div>
                <div class="email-date">${email.timestamp.substring(0, 10)}</div>
            `;
            emailListEl.appendChild(el);
        });
    }

    function renderEmailDetail(email) {
        const badge = email.category ? `<span class="badge badge-${email.category}">${email.category}</span>` : '';
        
        // Action Items
        let actionItemsHtml = '';
        if (email.action_items && email.action_items.length > 0) {
            actionItemsHtml = `
                <div class="action-items-box" style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #f59e0b;">
                    <strong>📋 Action Items:</strong>
                    <ul style="margin-left: 20px; margin-top: 8px;">
                        ${email.action_items.map(item => `<li>${item.task} (Due: ${item.deadline || 'N/A'})</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        detailContentEl.innerHTML = `
            <div class="detail-header">
                <div class="detail-subject">
                    ${email.subject}
                    ${badge}
                </div>
                <div class="detail-meta">
                    <div class="sender-info">
                        <div class="sender-avatar">${email.from[0].toUpperCase()}</div>
                        <div class="sender-details">
                            <span class="sender-name">${email.from}</span>
                            <span class="sender-email">&lt;${email.from}&gt;</span>
                        </div>
                    </div>
                    <div class="email-date">${email.timestamp}</div>
                </div>
            </div>
            ${actionItemsHtml}
            <div class="detail-body">${email.body}</div>
        `;

        // Check for draft
        if (email.draft_reply) {
            replyText.value = email.draft_reply.body;
            replyArea.classList.remove('hidden');
        }
    }

    function updateCounts() {
        // This is a simplified count update based on loaded emails
        // In a real app, this should come from the backend
        const count = emails.length;
        const activeNav = document.querySelector(`.nav-item[data-category="${currentCategory}"] .nav-count`);
        if (activeNav) activeNav.textContent = count;
    }

    // UI Logic
    function showList() {
        emailListContainer.classList.remove('hidden');
        emailDetailEl.classList.add('hidden');
        emailListContainer.style.display = 'flex';
    }

    function showDetail() {
        emailListContainer.style.display = 'none'; // Hide list completely
        emailDetailEl.classList.remove('hidden');
    }

    // AI Features
    aiTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            aiTabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        });
    });

    function resetAiPanel() {
        replyArea.classList.add('hidden');
        replyText.value = '';
        summaryResult.classList.add('hidden');
        summaryResult.textContent = '';
        chatMessages.innerHTML = '';
        
        // Reset to Reply tab
        aiTabs[0].click();
    }

    generateReplyBtn.addEventListener('click', async () => {
        if (!selectedEmailId) return;
        
        generateReplyBtn.disabled = true;
        generateReplyBtn.innerHTML = 'Generating...';
        
        try {
            const res = await fetch('/api/generate_reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email_id: selectedEmailId })
            });
            const data = await res.json();
            
            replyText.value = data.reply;
            replyArea.classList.remove('hidden');
        } catch (err) {
            console.error(err);
            alert('Error generating reply');
        } finally {
            generateReplyBtn.disabled = false;
            generateReplyBtn.innerHTML = '<span class="material-icons">auto_awesome</span> Generate Reply';
        }
    });

    saveDraftBtn.addEventListener('click', async () => {
        if (!selectedEmailId) return;
        
        try {
            await fetch('/api/drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email_id: selectedEmailId,
                    draft: {
                        to: 'Sender', // Simplified
                        subject: 'Re: Subject',
                        body: replyText.value,
                        created_at: new Date().toISOString()
                    }
                })
            });
            alert('Draft saved!');
        } catch (err) {
            console.error(err);
            alert('Error saving draft');
        }
    });

    summarizeBtn.addEventListener('click', async () => {
        if (!selectedEmailId) return;
        
        summarizeBtn.disabled = true;
        summarizeBtn.innerHTML = 'Summarizing...';
        
        try {
            const res = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email_id: selectedEmailId })
            });
            const data = await res.json();
            
            summaryResult.textContent = data.summary;
            summaryResult.classList.remove('hidden');
        } catch (err) {
            console.error(err);
            alert('Error summarizing');
        } finally {
            summarizeBtn.disabled = false;
            summarizeBtn.innerHTML = '<span class="material-icons">summarize</span> Summarize Email';
        }
    });

    // Chat
    async function sendChatMessage() {
        const query = chatInput.value.trim();
        if (!query || !selectedEmailId) return;
        
        // Add user message
        addChatMessage(query, 'user');
        chatInput.value = '';
        
        // Get context (email body)
        const emailBody = document.querySelector('.detail-body').textContent;
        
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query,
                    context: emailBody
                })
            });
            const data = await res.json();
            addChatMessage(data.response, 'ai');
        } catch (err) {
            console.error(err);
            addChatMessage('Error getting response', 'ai');
        }
    }

    function addChatMessage(text, role) {
        const div = document.createElement('div');
        div.className = `chat-msg ${role}`;
        div.textContent = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatSendBtn.addEventListener('click', sendChatMessage);
    // Prompt Modal
    const promptsBtn = document.getElementById('prompts-btn');
    const promptModal = document.getElementById('prompt-modal');
    const closePromptBtn = document.getElementById('close-prompt-btn');
    const savePromptBtn = document.getElementById('save-prompt-btn');
    
    // Prompt Inputs
    const promptInputs = {
        categorization: document.getElementById('prompt-categorization'),
        action_extraction: document.getElementById('prompt-action_extraction'),
        auto_reply: document.getElementById('prompt-auto_reply'),
        summarization: document.getElementById('prompt-summarization')
    };

    let currentPrompts = {};

    promptsBtn.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/prompts');
            currentPrompts = await res.json();
            
            // Populate inputs
            for (const [key, input] of Object.entries(promptInputs)) {
                if (currentPrompts[key]) {
                    input.value = currentPrompts[key].template;
                }
            }
            
            promptModal.classList.remove('hidden');
        } catch (err) {
            console.error(err);
            alert('Error loading prompts');
        }
    });

    closePromptBtn.addEventListener('click', () => {
        promptModal.classList.add('hidden');
    });

    savePromptBtn.addEventListener('click', async () => {
        savePromptBtn.disabled = true;
        savePromptBtn.textContent = 'Saving...';
        
        const updates = {};
        for (const [key, input] of Object.entries(promptInputs)) {
            updates[key] = { template: input.value };
        }

        try {
            await fetch('/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            alert('Prompts saved!');
            promptModal.classList.add('hidden');
        } catch (err) {
            console.error(err);
            alert('Error saving prompts');
        } finally {
            savePromptBtn.disabled = false;
            savePromptBtn.textContent = 'Save Prompts';
        }
    });
});
