from flask import Flask, send_from_directory, jsonify, request
import os
from database import EmailDatabase
from email_agent import EmailAgent
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='static')

# Initialize Database and Agent
db = EmailDatabase()
api_key = os.getenv('GROQ_API_KEY')
agent = EmailAgent(api_key) if api_key else None

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/api/emails', methods=['GET'])
def get_emails():
    category = request.args.get('category')
    if category and category != 'All':
        if category == 'Uncategorized':
            emails = [e for e in db.emails if not e.get('category')]
        else:
            emails = db.get_emails_by_category(category)
    else:
        emails = db.emails
    
    # Sort by timestamp descending
    emails = sorted(emails, key=lambda x: x.get('timestamp', ''), reverse=True)
    return jsonify(emails)

@app.route('/api/emails/<int:email_id>', methods=['GET'])
def get_email(email_id):
    email = db.get_email(email_id)
    if email:
        return jsonify(email)
    return jsonify({"error": "Email not found"}), 404

@app.route('/api/process', methods=['POST'])
def process_emails():
    if not agent:
        return jsonify({"error": "Agent not initialized"}), 500
    
    count = 0
    for email in db.emails:
        # Categorize
        cat_prompt = db.get_prompt('categorization')
        category = agent.categorize_email(email, cat_prompt)
        
        # Extract Actions
        action_prompt = db.get_prompt('action_extraction')
        actions = agent.extract_actions(email, action_prompt)
        
        db.update_email(email['id'], {
            'category': category,
            'action_items': actions
        })
        count += 1
        
    return jsonify({"message": f"Processed {count} emails"})

@app.route('/api/generate_reply', methods=['POST'])
def generate_reply():
    if not agent:
        return jsonify({"error": "Agent not initialized"}), 500
    
    data = request.json
    email_id = data.get('email_id')
    email = db.get_email(email_id)
    
    if not email:
        return jsonify({"error": "Email not found"}), 404
        
    reply_prompt = db.get_prompt('auto_reply')
    reply_body = agent.generate_reply(email, reply_prompt)
    
    return jsonify({"reply": reply_body})

@app.route('/api/summarize', methods=['POST'])
def summarize_email():
    if not agent:
        return jsonify({"error": "Agent not initialized"}), 500
    
    data = request.json
    email_id = data.get('email_id')
    email = db.get_email(email_id)
    
    if not email:
        return jsonify({"error": "Email not found"}), 404
        
    summary_prompt = db.get_prompt('summarization')
    summary = agent.summarize_email(email, summary_prompt)
    
    return jsonify({"summary": summary})

@app.route('/api/chat', methods=['POST'])
def chat():
    if not agent:
        return jsonify({"error": "Agent not initialized"}), 500
    
    data = request.json
    query = data.get('query')
    context = data.get('context')
    
    response = agent.chat_query(query, context)
    return jsonify({"response": response})

@app.route('/api/drafts', methods=['POST'])
def save_draft():
    data = request.json
    email_id = data.get('email_id')
    draft = data.get('draft')
    
    db.add_draft(email_id, draft)
    return jsonify({"message": "Draft saved"})

@app.route('/api/delete_draft/<int:email_id>', methods=['DELETE'])
def delete_draft(email_id):
    db.update_email(email_id, {'draft_reply': None})
    return jsonify({"message": "Draft deleted"})

@app.route('/api/prompts', methods=['GET'])
def get_prompts():
    return jsonify(db.prompts)

@app.route('/api/prompts', methods=['POST'])
def update_prompts():
    data = request.json
    for key, value in data.items():
        if key in db.prompts:
            # value is expected to be the prompt object, we need the template
            if isinstance(value, dict) and 'template' in value:
                db.update_prompt(key, value['template'])
    return jsonify({"message": "Prompts updated"})

@app.route('/api/reset', methods=['POST'])
def reset_inbox():
    db.reset_inbox()
    return jsonify({"message": "Inbox reset successfully"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
