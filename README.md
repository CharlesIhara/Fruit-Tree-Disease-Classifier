# Fruit Tree Disease Classification

## CREDIT

This project is variation of the project tutorial made by CodeBasics on Youtube. Much of their code was used as a template for this project. Here is their project repository: https://github.com/codebasics/potato-disease-classification

## OVERVIEW

I trained a convolutional neural network model using tensorflow to identify diseases from images of plant leaves. THe model was trained using 9,440 images of plant leaves (1,152 for validation, 1,204 for testing). The images consisted of the following crop-disease combinations:

1. Apple, Apple Scab
2. Apple, Black Rot
3. Apple, Healthy
4. Cherry, Powdery Mildew
5. Cherry, Healthy
6. Grape, Black Rot
7. Grape, Esca (Black Measles)
8. Grape, Healthy
9. Peach, Bacterial Spot
10. Peach, Healthy

The model was trained over 50 epochs, and achieved the following performance metrics by the end of training (see the [training file](Model%20Training.ipynb) for more details): 
- accuracy: 0.9737
- loss: 0.0827
- val_accuracy: 0.9540
- val_loss: 0.1556



## HOW TO RUN

### **First, install python and configure virtual environment:**

1. Install python

2. Create a new virtual environment (named venv) in the project folder:

`python -m venv venv`

3. Activate the virtual environment

`source venv/bin/activate`

4. Install dependencies from `requirements.txt`:

`pip install -r requirements.txt`

### **Next, we will set up the backend:**

### 1. Install Docker Desktop

### 2. Open Docker Desktop to start Docker Daemon

### 3. Download the Tensorflow Serving docker image:
`docker pull tensorflow/serving`

### 4. Start the docker container:
```bash
docker run -it -v /Users/charlesihara/Desktop/Development/Fruit-Tree-Disease-Classification:/Fruit-Tree-Disease-Classification -p 8501:8501 --entrypoint /bin/bash tensorflow/serving
```

NOTES:
- `-it` is used to start an interactiveteletype (TTY) session with the docker container, allowing interaction with the container's CLI
- `-v` is used to mount a given directory to a directory in the docker container
- we set the `entrypoint` to "bin/bash" so that the docker image opens in command line
- the last argument is the name of the container to start

### 5. Within the docker container, start the tf-serving server:
```bash
tensorflow_model_server --rest_api_port=8501 --model_name=fruit_tree_disease_model --model_base_path=/Fruit-Tree-Disease-Classification/models/
```

### 6. From project directory, run the backend python script to start the FastAPI server:
`python main_tf_serving.py`

### **Now that the backend is up and running, we have a few different options for how we can test the model:**

### Method 1: Set Up/Run the React Web Application

1. Install Node.js

2. Install NPM

3. Clone the `frontend` directory of this repository

4. Install Node Packages in `frontend` directory:
```bash
cd frontend
npm install --from-lock-json
npm audit fix 
```

5. Run the Web Application from `frontend` directory:
```bash
cd frontend
npm run start
```

6. The web application should open up in your default browser and be fully working!!!

**Troubleshooting tips:**
- if you are facing NPM dependency issues, these commands may be useful:
```bash
rm -rf node_modules  # remove current node packages
npm install --from-lock-json  # re-install node package versions listed in lock-json file
npm audit fix 
npm audit fix --force  # may need to run this line as well to forcefully update some packages
```

### Method 2: Set Up/Run the Flask Mobile Application

### **First, deploy the model to GCP**
1. Deploy the tf model to GCP (create GCP account, create new project, create new bucket, upload .h5 file to models folder)

2. Download Google Cloud SDK

3. Authenticate with Google Cloud SDK:

`gcloud auth login`

4. (optional) Switch current GCP Project:

`gcloud config set project project-id`

5. Deploy the predict function to GCP:

```bash
cd gcp
gcloud functions deploy predict --runtime python311 --trigger-http --memory 512 --project project_id
```

5. Enable Public Access to Function (via Google Cloud Console or CLI)

6. Test the trigger URL for the function using Postman (see details in Method 3)

### **Now, start setting up the Mobile App**

7. Install React Native CLI: https://reactnative.dev/docs/set-up-your-environment

8. Install dependencies in mobile app folder:

```bash
cd mobile-app
yarn install
```

9. Run the following:
```bash
cd ios
pod install
cd ../
```

10. Copy `.env.example` as `.env`

11. Change the API in `.env`

12. Create a Virtual Device in Android Studio or XCode

13. Move into mobile-app folder and run the app:

```bash
cd mobile-app
npm run android # or ios
```

14. App should open in the Simulator! Test out the functionality. On the backend, this is making a call to the gcloud function we deployed

### Method 3: Submit Requests via Postman

1. Download the Postman Application: https://www.postman.com

2a. Open Postman, set the following URL for local model prediction: http://localhost:8000/predict

2b. Alternatively, set the trigger URL to use the GCP-deployed model:

3. Select `POST` request

4. Under the `body` tab, select `form-data`

5. Type "file' in the `key` field (this is necessary to match the "file" parameter name of the "predict" function defined in our [python script](./main_tf_serving.py))

6. Select an image as the `value`

7. Press 'send'

8. The predicted class and confidence should output below