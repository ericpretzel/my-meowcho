import json
import urllib3
from aryn_sdk.partition import partition_file
import io
import base64


api_key = '' # api key on AWS
url = "https://api.aryn.cloud/v1/document/partition"

# this function is called in AWS lambda
def lambda_handler(event, context):
    # get file from parameters
    file: str = event['body']
    bytesio = io.BytesIO(base64.b64decode(file))

    response = partition_file(bytesio, api_key, use_ocr=True,
                extract_images=False,
                extract_table_structure=True,
                ocr_images=True)
    print(response)
    return response
