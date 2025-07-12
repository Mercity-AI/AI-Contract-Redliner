import os
from openai import OpenAI
from PROMPTS import SYSTEM_PROMPT, USER_PROMPT

from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENROUTER_API_KEY"), base_url="https://openrouter.ai/api/v1")



def call_model(model, messages, temperature=0.0):
    """
    Call a model with a given model, messages, and temperature.
    """
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
    )
    return response.choices[0].message.content