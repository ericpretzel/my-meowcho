import json
import urllib3
from aryn_sdk.partition import partition_file


api_key = '' # api key on AWS
url = "https://api.aryn.cloud/v1/document/partition"

# this function is called in AWS lambda
def lambda_handler(event, context):
    # get file from parameters
    http = urllib3.PoolManager()
    file = event['queryStringParameters']['file']

    headers = {
        "Authorization": "Bearer " + api_key
    }

    fields = {
        "file": file,
        "options": {
            "extract_images": False,
            "extract_table_structure": True,
            "use_ocr": True,
        }
    }

    response = http.request(
        "POST",
        url,
        fields=fields,
        headers=headers
    )

    return response.data.decode('utf-8')
