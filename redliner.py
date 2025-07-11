import os
from openai import OpenAI
from PROMPTS import SYSTEM_PROMPT, USER_PROMPT
client = OpenAI(api_key=os.getenv("OPENROUTER_API_KEY"), base_url="https://openrouter.ai/api/v1")



MODEL = "moonshotai/kimi-k2"




response = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": USER_PROMPT},
    ],
)