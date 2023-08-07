import openai
import os
import json
import requests
from dotenv import load_dotenv


load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

with open("sample_conversations.txt", "r") as f:
    sample_conversations = f.read()

# prompt to Discovery questions
DQ_system_msg = f"""
Given the conversation between Clinician and Patient, assist the Clinician.

Your response sentence must follow the following rules:
1. Consider yourself as the Clinician.
2. Provide a potential empathetic response to the patient comments and questions.
3. Focus on providing professional solutions and ask about the patient's condition, but don't ask the patient if he or she doesn't like detailed questions.
4. Must start with "Clinician: ".
5. Use the active voice. The active voice is stronger and more engaging than the passive voice.
6. Use specific language. Avoid vague language that can be interpreted in multiple ways.
7. Proofread your response sentence carefully. Typos and grammatical errors will make you look unprofessional.
"""

# prompt to book an appointment
BA_system_msg = f"""
Given the conversation between Clinician and Patient, book an appointment between Clinician and Patient.

Your response sentence must follow the following rules:
1. Consider yourself as the Clinician.
2. Book an appointment between Clinician and Patient.
3. Use the calendar link as "https://calendly.com/workartow2" for the meeting. Do not mention the word "https://calendly.com/workartow2" more than twice.
4. Remember, your role is to book only, do not mention other words not related to the booking.
5. Must start with "Clinician: ".

Here are some sample response setences:
Here is a scheduling assistant link. https://calendly.com/workartow2
=================
Here is a link for you to schedule an appointment. https://calendly.com/workartow2
=================
Here is a scheduling link. https://calendly.com/workartow2
"""

# prompt to know the drug name
PDN_system_msg = """
Given the conversation between Clinician and Patient, provide the drug names.

you will generate the answer as following steps:

Step 1: When there are any drugs being discussed in the conversation, please only return those drug names and stop generation.
Step 2: only return None and stop generation.

You must only return drug name. If there are multiple drugs you are expecting, return all names of them and split by ','.

Here are sample answers:
Acetaminophen
==========
Ibuprofen, Aspirin
==========
None
"""

# prompt to provide the drug info
PDI_system_msg = f"""
Given the conversation between Clinician and Patient, provide all of the standard drug facts (dosage, side effects, etc).  Please source this information from OpenFDA.

Your response sentence must follow the following rules:
1. Consider yourself as the Clinician.
2. Provide the detailed facts of following all drugs (dosage, side effects, warnings etc).
3. Must start with "Clinician: ".
4. Keep it short. Aim for less than 180 words in your Upwork proposal. 120-160 words is ideal.
5. Use the active voice. The active voice is stronger and more engaging than the passive voice.
6. Use specific language. Avoid vague language that can be interpreted in multiple ways.
7. Proofread your response sentence carefully. Typos and grammatical errors will make you look unprofessional.

"""

# prompt to Categorize topic
CT_system_msg = """
Given the conversation between Clinician and Patient, Categorize the *current* topic.
Based off of the previous response in the conversation, please bucket the *current* topic of the conversation into the following topics. Note that multiple categories are possible at one time.  Emphasis on the word “current” - we don't want the flag a topic if it was discussed several responses ago but the conversation has moved on from it as a topic. 

There will be 3 potential categories:
- Book an appointment: If the intent in the previous response is related to scheduling an appointment, then categorize as 'Book an Appointment'.
- Provide drug information: If in the previous response, the patient or clinician is discussing a particular drug, then categorize the topic as “Provide drug information'.  This would be a good one to use a healthcare-specific language model for.
- Discovery questions: If in the previous response, the patient has told the clinician that they are experiencing a particular symptom, have had an injury, is discussing hardships, struggles, symptoms, or health related issues, then categorize as 'Discovery questions'.  This would be a good one to use a healthcare-specific language model for.  Make sure to have the response be particularly empathetic when we are in this topic type.

You must only return Category name. If there are multiple categories you are expecting, return all names of them and split by ','.

Here are sample answers:
Provide drug information
==========
Book an appointment, Discovery questions
==========
"""

# prompt to Assess patient sentiment
APS_system_msg = """
Given the conversation between Clinician and Patient, Assess the the patient sentiment.
Based off of the previous response in the conversation, determine the current sentiment of the patient.

There will be 3 potential categories:
- Positive
- Neutral
- Negative

You must only return one of them.

Here are some sample response setences:
Positive
=================
Negative
=================
"""

# get the drug info from OpenFDA
def get_drug_info(drug_name):
    url = f"https://api.fda.gov/drug/label.json?search=openfda.generic_name:{drug_name}&limit=1"
    response = requests.get(url).text

    if 'error' in response or 'Error' in response:
        return "error"
    else:
        # Extract and print some drug information
        data = json.loads(response)
        return data['results'][0]


# response with the drug info
def generate_answer_with_drug_info(humanmessage):
    # get the drug names   
    response = openai.ChatCompletion.create(model="gpt-4",
                                            messages=[{"role": "system", "content": PDN_system_msg},
                                                      {"role": "user", "content": humanmessage}])
    
    output = response["choices"][0]["message"]["content"]
    
    drug_infos = []                                         # Inintialize the drug information list
    # if GPT can't get the specific drug name, return.
    if output == "None":
        return "I can't figure out the specific drug names."
    # else, provide the drug information
    else:
        drug_names = output.split(",")
        
        # provide about the first 3 drugs
        for dn in drug_names[:3]:
            print("asking... ", dn)
            response = get_drug_info(dn)
            if response == 'error':
                drug_infos.append(dn)
            else:
                drug_infos.append(response)
        
        # message to get the drug info
        message = f"""
{PDI_system_msg}

Here are previous conversation:
{humanmessage}

Here are drug information:
{drug_infos}
"""
        
        # get the drug info
        response = openai.ChatCompletion.create(model="gpt-3.5-turbo-16k",
                                            messages=[{"role": "system", "content": message}])
        
        output = response["choices"][0]["message"]["content"].replace("Clinician: ", "")

        return output

# response without considering drug info
def get_information(question, humanmessage):
    systemmessage = DQ_system_msg

    # use cases of question.
    if question == 'Potential response text: "Discovery questions"':
        systemmessage = DQ_system_msg
    elif question == 'Potential response text: "Book an appointment"':
        systemmessage = BA_system_msg
    elif question == 'Potential response text: "Provide drug information"':
        response = generate_answer_with_drug_info(humanmessage)                     # if it needs drug info, get it from OpenFDA
        return response
    elif question == 'Backoffice use: "Categorize topic"':
        systemmessage = CT_system_msg
    elif question == 'Backoffice use: "Assess patient sentiment"':
        systemmessage = APS_system_msg
    
    # get the response from GPT.
    response = openai.ChatCompletion.create(model="gpt-3.5-turbo-16k",
                                            messages=[{"role": "system", "content": systemmessage},
                                                      {"role": "user", "content": humanmessage}])
    # Initialize the system message

    # # Create a dataset using GPT
    # response = openai.ChatCompletion.create(model="gpt-4",
    #                                         messages=[{"role": "system", "content": system_msg},
    #                                                   {"role": "user", "content": content}])
    output = response["choices"][0]["message"]["content"].replace("Clinician: ", "")
    return output


def make_humanmessage(chat_history):
    humanmessage = ""  # Initialize the human message
    lastauthor = ""  # Initialize the last author
    for ch in chat_history:
        currentauthor = ch['author']  # get the current author
        # if start
        if lastauthor == "":
            humanmessage += f"{currentauthor}: {ch['message']}"
            lastauthor = currentauthor
        # else if the current author is the last author, add the message without changing the last author
        elif currentauthor == lastauthor:
            humanmessage += f"\n{ch['message']}"
        # else add and change the last author
        else:
            humanmessage += f"\n\n{currentauthor}: {ch['message']}"
            lastauthor = currentauthor
    return humanmessage


# get respond of the GPT based on the conversation
def get_GPTRespond(chat_history, question):
    # make the human message and last author
    humanmessage = make_humanmessage(chat_history)
    
    # get the drug info
    output = get_information(question, humanmessage)

    return output

# print(get_drug_info("Ibuprofen Dye Free"))