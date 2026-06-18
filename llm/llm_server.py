
!pip install -q unsloth
!pip install -q fastapi uvicorn nest_asyncio pyngrok

from google.colab import drive
drive.mount("/content/drive")

from unsloth import FastLanguageModel
from peft import PeftModel

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="Qwen/Qwen2.5-3B-Instruct",
    max_seq_length=2048,
    load_in_4bit=True,
)

model = PeftModel.from_pretrained(
    model,
    "/content/drive/MyDrive/idealab_qwen_lora_final"
)

FastLanguageModel.for_inference(model)

print(" Model Loaded Successfully")

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import nest_asyncio
import threading

app = FastAPI()

class ChatRequest(BaseModel):
    messages: list

@app.post("/generate")
def generate(request: ChatRequest):

    text = tokenizer.apply_chat_template(
        request.messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    inputs = tokenizer(
        text,
        return_tensors="pt"
    ).to(model.device)

    outputs = model.generate(
        **inputs,
        max_new_tokens=150,
        temperature=0.7,
        do_sample=True,
    )

    decoded = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

    assistant_response = decoded.split("assistant")[-1].strip()

    return {
        "response": assistant_response
    }

nest_asyncio.apply()

def run():
    uvicorn.run(app, host="0.0.0.0", port=8000)

threading.Thread(target=run).start()

from pyngrok import ngrok

ngrok.set_auth_token("3FFg8MfbnkEtPONKenC9ABL97dJ_7gRbRbWha75E2TXYxw9fX")

public_url = ngrok.connect(8000)

print(public_url)