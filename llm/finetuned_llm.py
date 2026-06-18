!pip install -q unsloth transformers datasets trl peft accelerate bitsandbytes

import torch
import transformers
import datasets
import peft
import trl

print("All libraries imported successfully!")

!pip list | grep unsloth

import unsloth

from unsloth import FastLanguageModel

max_seq_length = 2048

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="Qwen/Qwen2.5-3B-Instruct",
    max_seq_length=max_seq_length,
    load_in_4bit=True,
)

model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=[
        "q_proj",
        "k_proj",
        "v_proj",
        "o_proj",
        "gate_proj",
        "up_proj",
        "down_proj",
    ],
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
)

model.print_trainable_parameters()

from google.colab import files

uploaded = files.upload()

from datasets import load_dataset

dataset = load_dataset(
    "json",
    data_files="idealab_dataset_.jsonl",
    split="train"
)

print(dataset)

def formatting_prompts_func(examples):
    texts = []

    for messages in examples["messages"]:
        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
        )
        texts.append(text)

    return {"text": texts}

dataset = dataset.map(
    formatting_prompts_func,
    batched=True,
)

print(dataset[0]["text"])

dataset = dataset.train_test_split(
    test_size=0.1,
    seed=42
)

print(dataset)

from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="idealab_qwen",
    num_train_epochs=3,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=8,
    learning_rate=2e-4,
    logging_steps=5,
    fp16=True,
    report_to="none",
    save_strategy="no",
)

from trl import SFTTrainer

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset["train"],
    dataset_text_field="text",
    max_seq_length=2048,
    args=training_args,
)

print(dataset["train"].column_names)

import transformers
import trl
import unsloth

print(transformers.__version__)
print(trl.__version__)
print(unsloth.__version__)

trainer.train()

from google.colab import drive
drive.mount('/content/drive')

tokenizer.save_pretrained("/content/drive/MyDrive/idealab_qwen_lora_final")

model.save_pretrained("/content/drive/MyDrive/idealab_qwen_lora_final")

FastLanguageModel.for_inference(model)

prompt = """
User: I want to start an AI-powered platform for small businesses.

Assistant:
"""

inputs = tokenizer(
    prompt,
    return_tensors="pt"
).to("cuda")

outputs = model.generate(
    **inputs,
    max_new_tokens=256,
    temperature=0.7,
    do_sample=True,
    pad_token_id=tokenizer.eos_token_id,
)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))

prompt = """User: I want to start an AI-powered platform for small businesses.
Assistant:"""

inputs = tokenizer(
    prompt,
    return_tensors="pt"
).to("cuda")

outputs = model.generate(
    **inputs,
    max_new_tokens=200,
    temperature=0.7,
    do_sample=True,
)

response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)

messages = [
    {
        "role": "user",
        "content": """
I want to build an AI-powered platform that helps students prepare for job interviews.

Target users: College students and fresh graduates.

Problem: Students lack interview practice and personalized feedback.

Key features:
- Mock interviews
- AI feedback
- Resume analysis

Business model: Monthly subscription.
"""
    }
]

text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)

inputs = tokenizer(text, return_tensors="pt").to(model.device)

outputs = model.generate(
    **inputs,
    max_new_tokens=200,
    temperature=0.7,
)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))

from unsloth import FastLanguageModel

FastLanguageModel.for_inference(model)

messages = [
    {
        "role": "system",
        "content": "You are IdeaLab, an AI startup mentor. Ask one relevant question at a time. After collecting enough information, generate a structured product concept."
    },
    {
        "role": "user",
        "content": "I want to build a startup."
    },
    {
        "role": "assistant",
        "content": "Who are your primary users?"
},
{
    "role": "user",
    "content": "Students."
},
    {
    "role": "assistant",
    "content": "What problem do students face that you'd solve?"
},
{
    "role": "user",
    "content": "Actually, I want to focus on small businesses instead of students."
}
]

text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)

inputs = tokenizer(
    text,
    return_tensors="pt"
).to(model.device)

outputs = model.generate(
    **inputs,
    max_new_tokens=100,
    temperature=0.7,
    do_sample=True,
)

response = tokenizer.decode(
    outputs[0],
    skip_special_tokens=True
)

print(response)