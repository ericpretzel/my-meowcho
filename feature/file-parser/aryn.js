console.log("gradescope opened")
const downloadButton = document.getElementsByClassName('actionBar--action tiiBtn tiiBtn-secondary')
const href = 'https://www.gradescope.com' + downloadButton[2].getAttribute("href")

const form = new FormData();
form.append("options", "{\n  \"selected_pages\": [\n    123\n  ],\n  \"extract_images\": true,\n  \"extract_table_structure\": true,\n  \"use_ocr\": true,\n  \"threshold\": \"auto\",\n  \"chunking_options\": {\n    \"strategy\": \"context_rich\",\n    \"tokenizer\": \"openai_tokenizer\",\n    \"tokenizer_options\": {},\n    \"max_tokens\": 123,\n    \"merge_across_pages\": true\n  },\n  \"output_format\": \"json\"\n}");

const options = {
  method: 'POST',
  headers: {Authorization: 'Bearer ', 'Content-Type': 'multipart/form-data'}
};

options.body = form;

fetch('https://api.aryn.cloud/v1/document/partition', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));