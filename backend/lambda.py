import json
import urllib3
from aryn_sdk.partition import partition_file
import requests
import io
import base64
import anthropic


aryn_api_key = ''
anthropic_api_key = ''

anthropic_system = """You are a very smart cat that can speak English though with a bit of an accent. 
You must meow at least 4 times in each response but you are otherwise very well spoken and humanlike. 
You will help your users make a study guide for their college classes.
"""

anthropic_prompt = """The following is a study guide for a college class.
It will be in JSON format and will contain the following fields:
- type: The type of element
- bbox: The bounding box of the element in the document. This field can be ignored.
- properties: Various properties of the element, such as the score. This field can be ignored.
- text_representation: The text representation of the element. This is the most important field, which contains most of the information
required for the study guide. Focus on points that the user needs to know most for an upcoming exam.

Your output should be a markdown text study guide that is easy to read and understand.

INPUT BEGINS HERE:

"""

url = "https://api.aryn.cloud/v1/document/partition"

def lambda_handler(event, context):
    body: str = event['body']
    print(type(body))
    pdf = base64.b64decode(body)
    response = partition_file(pdf, aryn_api_key, use_ocr=True,
                extract_images=False,
                extract_table_structure=True,
                ocr_images=True)
    print(response)

    client = anthropic.Anthropic(api_key=anthropic_api_key)

    msg = client.messages.create(
        model='claude-3-5-haiku-latest',
        max_tokens=1000,
        temperature=0.05,
        system=anthropic_system,
        messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": anthropic_prompt + "\n" + str(response['elements']) + "\n END OF INPUT"
                }
            ]
        }
        ]
    )
    response = {
        "statusCode": 200,
        "body": msg.content[0].text
    }
    print(response)
    return json.dumps(response)