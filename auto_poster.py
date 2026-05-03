import os
import sys
import requests
from openai import OpenAI

def main():
    # 1. Grab the file path passed by GitHub Actions
    if len(sys.argv) < 2:
        print("No file provided.")
        return
    file_path = sys.argv[1]

    # 2. Load API Keys from GitHub Secrets
    openai_key = os.environ.get("OPENAI_API_KEY")
    linkedin_token = os.environ.get("LINKEDIN_ACCESS_TOKEN")
    author_urn = os.environ.get("LINKEDIN_AUTHOR_URN")

    # 3. Read the Markdown file
    with open(file_path, 'r') as file:
        md_content = file.read()

    # 4. Ask the AI to write the LinkedIn Post
    print("Drafting post with AI...")
    client = OpenAI(api_key=openai_key)
    ai_prompt = """
    You are a professional developer relations expert. Read the following markdown blog post 
    and write an engaging LinkedIn post summarizing it. 
    Rules: 
    - Keep it under 150 words.
    - Do NOT use markdown like **bold** or *italics* (LinkedIn doesn't support them).
    - Use 2-3 relevant hashtags.
    - End by encouraging the reader to check out the full post on my portfolio.
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini", # Fast and cheap for text summarization
        messages=[
            {"role": "system", "content": ai_prompt},
            {"role": "user", "content": md_content}
        ]
    )
    linkedin_text = response.choices[0].message.content

    # 5. Post to LinkedIn via REST API
    print("Publishing to LinkedIn...")
    url = "https://api.linkedin.com/v2/ugcPosts"
    headers = {
        "Authorization": f"Bearer {linkedin_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }
    payload = {
        "author": author_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": linkedin_text
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }

    res = requests.post(url, headers=headers, json=payload)
    
    if res.status_code == 201:
        print("Successfully posted to LinkedIn!")
    else:
        print(f"Failed to post. Error: {res.text}")

if __name__ == "__main__":
    main()
