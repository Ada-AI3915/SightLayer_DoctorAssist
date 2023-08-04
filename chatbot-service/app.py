import os
from flask import Flask, request
from GPT_API import get_GPTRespond
from dotenv import load_dotenv


load_dotenv()
app = Flask(__name__)


# default url response
@app.route('/')
def index():
    return {'info': 'Doctor Assist Chatbot API'}


# chatbot respond
@app.route('/api/get-reference', methods=['POST'])
def post_respond():
    data = request.get_json()                # Get the posted data
    chatHistory = data["history"]            # Get the conversation chatHistory
    gptAnswer = get_GPTRespond(chatHistory)  # Get the respond of GPT API
    respond = {"botMessage": gptAnswer}
    return respond, 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=os.getenv("CHATBOT_SERVICE_PORT"))
