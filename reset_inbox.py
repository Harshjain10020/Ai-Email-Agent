import json

def reset_inbox():
    with open('mock_inbox.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for email in data['emails']:
        email['category'] = None
        email['action_items'] = []
        email['draft_reply'] = None
        
    with open('mock_inbox.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("Inbox reset complete.")

if __name__ == "__main__":
    reset_inbox()
