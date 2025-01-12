import json
import urllib3
from aryn_sdk.partition import partition_file
from requests_toolbelt import MultipartDecoder
import io
import base64


api_key = '' # api key on AWS
url = "https://api.aryn.cloud/v1/document/partition"

# this function is called in AWS lambda
def lambda_handler(event, context):
    body: str = event['body']
    pdf = base64.b64decode(body)
    response = partition_file(pdf, api_key, use_ocr=True,
                extract_images=False,
                extract_table_structure=True,
                ocr_images=True)
    print(response)
    return response
