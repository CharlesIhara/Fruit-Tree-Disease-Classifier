from fastapi import FastAPI, File, UploadFile
import uvicorn
from io import BytesIO
from PIL import Image
import numpy as np
import tensorflow as tf
import requests
from fastapi.middleware.cors import CORSMiddleware

"""
Overview:
request from Postman or React JS website 
-> received by FastAPI server (running on port 8000) 
-> sent to tf serving (running on port 8501) 
-> tf serving passes the image into the latest "fruit_tree_disease_model"
-> response (class prediction) is sent back to FastAPI

How to Run:
1. download tensorflow serving docker image
docker pull tensorflow/serving

2. start the docker container:
- this copies the given project directory to a directory in the docker container
- we set the entrypoint to "bin/bash" so that the docker image opens in command line
docker run -it -v /Users/charlesihara/Desktop/Development/Fruit-Tree-Disease-Classification:/Fruit-Tree-Disease-Classification -p 8501:8501 --entrypoint /bin/bash tensorflow/serving

3. within docker container, start the tf-serving server:
tensorflow_model_server --rest_api_port=8501 --model_name=fruit_tree_disease_model --model_base_path=/Fruit-Tree-Disease-Classification/models/

4. From project directory, run this python script
python main_tf_serving.py

5. NOTE: when testing the backend using Postman, follow these steps exactly:
- URL: http://localhost:8000/predict
- POST request
- under "body" tab -> select "form-data"
- type "file" in "key" field (this is necessary to match the parameter name of the "predict" route defined below)
- select an image from files

"""

# fast api server is running on port 8000
app = FastAPI()

# need to allow communication with the frontend origin
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_headers=['*'],
    allow_methods=['*']
)

# tf sering is running on port 8501
endpoint = "http://localhost:8501/v1/models/fruit_tree_disease_model:predict"

CLASS_NAMES = ['Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy', 'Peach___Bacterial_spot', 'Peach___healthy']

# read the image
def read_file_as_image(data) -> np.ndarray:
    # unpack image bytes into np array
    image = np.array(Image.open(BytesIO(data)))
    return image

# backend test method
@app.get("/ping")
async def ping():
    return "Hello, I am alive"

# prediction method (sends request to model on tf-serving)
@app.post("/predict")
async def predict(
    # input: file sent by user (image of plant leaf)
    file: UploadFile = File(...)
):
    """
    read the input file
    - using await, we can effectively process multiple requests

    image format
    - model does not accept a single image; rather, it takes a batch of images
    - so if we 1 image, it has to be a 2D array: [[133, 240, 80]]

    get class names
    - predictions is a 2D array, so we have to take the inner array (predictions[0])
    - get the index of the highest probability
    - map that index to a class name
    """
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)

    # Instead of calling the model prediction here directly, we'll call tf-serving
    json_data = {
        "instances": img_batch.tolist()
    }
    response = requests.post(endpoint, json=json_data)
    prediction = np.array(response.json()["predictions"][0])
    predicted_class = CLASS_NAMES[np.argmax(prediction)]

    # parse the model prediction into crop, disease, confidence
    predicted_class_tokens = predicted_class.split("___")
    crop_name = predicted_class_tokens[0]
    disease_name = predicted_class_tokens[1].replace('_', ' ')

    confidence = np.max(prediction).item()
    return {
        'crop_name':crop_name,
        'disease_name': disease_name,
        'confidence':confidence
    }

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)
