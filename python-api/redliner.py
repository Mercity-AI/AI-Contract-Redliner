import json
from utils import call_model
from PROMPTS import SYSTEM_PROMPT, USER_PROMPT
from rich import print

import os
from dotenv import load_dotenv

load_dotenv()

MODEL = os.getenv("MODEL")



def redline(preferences, contract):
    """
    Redline the contract based on user preferences.
    """
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": USER_PROMPT.format(preferences=preferences, contract=contract)},
    ]
    response = call_model(MODEL, messages)
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return response


if __name__ == "__main__":
    preferences = "I prefer short term contracts under 1 year, and no non-compete clauses."

    with open("contract.txt", "r") as f:
        contract = f.read()

    result = redline(preferences, contract)
    print(result)

    with open("redlined_contract.txt", "w") as f:
        f.write(json.dumps(result, indent=4))