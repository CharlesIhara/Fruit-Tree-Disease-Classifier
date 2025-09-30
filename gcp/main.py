from google.cloud import storage
import tensorflow as tf
import numpy as np
from PIL import Image
from flask import jsonify

BUCKET_NAME = "fruit-tree-disease-classification-models"
class_names = ['Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy', 'Peach___Bacterial_spot', 'Peach___healthy']

# NOTE: this is the name of model in bucket on google cloud
MODEL_NAME = "models/1.h5"
DESTINATION_FILENAME = "/tmp/1.h5"

model = None

# blob = binary large object
def download_blob(bucket_name, source_blob_name, destination_file_name):
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(source_blob_name)
    blob.download_to_filename(destination_file_name)

def predict(request):

    global model
    
    # only download the model if not already there
    if model is None:
        download_blob(
            BUCKET_NAME,
            MODEL_NAME,
            DESTINATION_FILENAME
        )
        model = tf.keras.models.load_model(DESTINATION_FILENAME)
    
    image = request.files["file"]

    # convert the image to RGB
    image = np.array(Image.open(image).convert("RGB").resize((256,256)))

    # scale image
    image = image / 255

    # convert to batch (to match model input requirement)
    img_batch = tf.expand_dims(image, 0)

    predictions = model.predict(img_batch)
    predicted_class = class_names[np.argmax(predictions[0])]

    # parse the model prediction into crop, disease, confidence
    predicted_class_tokens = predicted_class.split("___")
    crop_name = predicted_class_tokens[0]
    disease_name = predicted_class_tokens[1].replace('_', ' ')
    confidence = np.round(max(predictions[0])*100, 2)
    
    # need to return as json
    return jsonify({
        'crop_name':crop_name,
        'disease_name': disease_name,
        'confidence':confidence
    })
    

